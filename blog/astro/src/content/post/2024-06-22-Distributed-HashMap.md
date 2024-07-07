---
title: 'Distributed HashMap'
pubDate: 2024-07-06
updatedDate: 2024-07-06
description: 'Learning distributed systems programming with a distributed HashMap in Rust.'
author: 'Jackson Kennedy'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'The full Astro logo.'
tags: ["rust", "raft", "distributed-systems"]
---

It's easy to push the complex nature of a database onto a cloud provider. Need a key-value database? In a handful of API calls, create a DynamoDB table, or maybe even an S3 bucket. Most scenarios will be served well with a database like this. You can learn everything you need about your chosen database from public documentation never needing to know enough to rebuild it from scratch. But, there are scenarios where you may need to break from the mold and build your own database. Or you may just think it would be cool to try. Especially one built to be distributed from the ground up. [This talk](https://www.youtube.com/watch?v=sc3J4McebHE) gives some insights into what its like running a database like that (specifically S3). I wanted to start doing things that would let me meaningfully contribute to systems like this. For that reason I've built my own toy version of a distributed database.

### Failure

Before I talk about what I've built I want to talk about some failure modes for a database. Particularly the failure modes I was interested in finding solutions for. I'll use an imaginary website I've built to track my todo list that runs on WebServer and uses a made-up database called FancyDb. The call path for getting the data onto a webpage in my browser may look as follows.

![Flowchart of call from Me to WebServer to FancyDb](/FirstFancyDb.svg)

My browser makes a `GET todos` request to WebServer and WebServer then reaches out to FancyDb to retrieve the list of my todos. WebServer then returns to me `["Todo 1", "Todo 2"]` or returns some sort of `ERROR 500` if a failure occurred. When I want to add a todo, my browser makes a `PUT "Todo 3"` request to WebServer which then reaches out to FancyDb to make a new update. FancyDb either accepts that update or returns a failure. WebServer then notifies me my todo has been saved or that there was an error.

FancyDb is a single machine. All requests to FancyDb are served by one server and all data is stored on that server. Backups are made and saved elsewhere. Assume FancyDb's server hardware dies making FancyDb and its data inaccessible. I have to detect FancyDb is down and then take an action to restore a new version of the database. The bulk of this time will be taken up by restoring a new version of FancyDb from a backup. This extended downtime will annoy me, the customer. A simple solution to this downtime problem may be the following.

![Flowchart of call from Me to WebServer to FancyDb with async replication](/AsyncFancyDb.svg)

FancyDb2 is a on a separate server from FancyDb. FancyDb2 asynchronously receives any updates made to FancyDb. Assume again, FancyDb crashes but now I have FancyDb2 on standby ready to go. Once it is detected that FancyDb is down, WebServer can start talking to FancyDb2 instead. This will involve less downtime because as soon as failure is detected it can be remediated. However, what happens if FancyDb fails after acknowledging an update from WebServer but before asynchronously writing the data to FancyDb2? When FancyDb2 comes online it will not have `"Todo 3,012"` and I will be annoyed again because now I have to go recreate that todo item. Lets tweak this again and make the replication to FancyDb2 synchronous to solve this problem.

![Flowchart of call from Me to WebServer to FancyDb with sync replication](/SyncFancyDb.svg)

Now anytime an update is made to FancyDb we are guaranteed to have made that update to FancyDb2. So, in the event that FancyDb crashes, we can cut-over to FancyDb2 with minimal downtime and with no fear of data being lost. Its a win-win. We've solved the previous two problems of lack of availability and lack of durability.

However we now start seeing some new failure modes that don't have clear answers. First, what if FancyDb2 crashes but FancyDb does not. Do we let WebServer make its update without it being made on both servers or do we ignore it and tell WebServer there was a failure? In other words, do we accept re-introducing the previous failure mode of losing data while we wait for FancyDb2 to be restored or do we refuse to accept any new updates until we can guarantee they've been replicated to FancyDb2. We've also introduced a new network call in the regular request path that can lead to failure. FancyDb and FancyDb2 could both be up and running but be unable to make requests to each other. Before, if WebServer couldn't talk to FancyDb then the request would return an error which is an easy answer to come to. Now what if WebServer can talk to FancyDb but FancyDb can't talk to FancyDb2?

We are now at a point where we have some difficult questions to answer about how we want our database to function and each decision we make comes with tradeoffs. This is where using consensus algorithms is valuable. They provide answers to how a system should behave in many of the scenarios I just described and event others I did not describe. They are not built to handle every single one with zero downtime or with completely up to date data. But they are algorithms that will have particular behavioral characteristics when implemented correctly that can be relied on. They are also configurable to a systems needs.

With all that in mind, I decided it would be most interesting to implement a database based on a consensus algorithm and I decided to do so with Raft using [this paper](https://raft.github.io/raft.pdf) as a guide. My implementation is written in Rust, which I only mention because I describe a few implementation details using Rust code. The rest of this page will describe what exactly was implemented and will not provide an in depth explanation of how Raft functions. For those details, the linked paper is an excellent resource.


### Define "implemented Raft"
To quote the papers opening sentence "Raft is a consensus algorithm for managing a replicated log". I've done exactly that, with some caveats. As described in the paper, my implementation elects a leader that is responsible for propagating all write requests to the remaining followers as they are received. The contents of these requests are written to each servers log and when the proper conditions are met they are committed to a state machine. The log is represented as a `Vec<String>` and the state machine is a `HashMap<String, String>`. Neither of these data structures are ones that are persisted to permanent storage. In my opinion, this detail means that I haven't completely "implemented Raft". Permanent storage introduces failure modes that are handled by the full algorithm that are ignored completely with this implementation. For example, in my implementation if a server crashes all of its data is gone since it was just in the program's memory. However, when persisting the log and/or state machine to permanent storage when just the Raft program itself crashes and not the server itself, recovery is possible. Scenarios like this complicate leader elections if an elected leader crashes and then comes back online later still claiming to be leader. This wrinkle is handled using the `term` value but my implementation doesn't exercise this system behavior. I would like to make the implementation more complete but for now I will discuss the implementation as is<sup>1</sup>.

### The Database
On its own, a Raft cluster isn't doing anything. An agreed upon log has to be used for something so my implementation is used to create a key-value database<sup>2</sup>.

There are a few things needed on top of just the Raft algorithm to make a database. Raft defines a way for servers to agree on a shared log but it doesn't define a good mechanism for how a client outside of the Raft cluster can interact with it. The goal of an outside client is just to persist data and then get that data back, they don't need to know what it means to "propose a value" or "append an entry". With this in mind I built the Raft server in such a way that is initialized and then the underlying log is made available via the API in the following trait.

```rust
pub trait ReadAndWrite {
    async fn get_value(
        &self,
        get_value_input: GetValueInput
    ) -> Result<GetValueOutput, ReadError>;

    async fn propose_value(
        &self,
        propose_value_input: ProposeValueInput,
    ) -> Result<ProposeValueOutput, WriteError>;
}
```

Using this trait, another server located on host with the Raft server can be used to serve customer requests while interacting with the Raft bits behind the scenes. This frontend server can serve outside clients via an API that takes GET or PUT requests (not HTTP GET/PUT though) and can then allow the Raft server it shares the host with to handle reading/writing the data. This allows for a simple API to be made available to clients while not abstracting away so many details that there are misunderstandings about expected behavior.

To utilize this frontend server clients will need to make requests somehow. To do so, clients won't want to write their own code to make network calls so I've created a hand-rolled software client that can be used for making requests. It ensures HTTPS requests are made using the HTTP/2 protocol and that all request bodies are encoded using protobuf. For context, the Raft server uses gRPC and is configured to only use HTTP<sup>3</sup>.

### Conclusion

For anyone looking to learn more about distributed systems or more specifically a distributed database I would highly recommend taking on a project like this. Initially I was hoping to only implement the Raft algorithm but to keep myself interested I found ways to make it "real world". While building something "real world" you'll find all kinds of different pieces of the puzzle that interest you that you can take a stab at implementing. It won't be perfect but building something yourself will give you insights you can't get otherwise into the systems/code you use all the time.

### Footnotes

<sup>1</sup> - I would like to write to disk and use a more permanent storage mechanism instead of just using a `HashMap` at some point. My current plan is to use RocksDB since it is a Key/Value engine that I have heard of before. I also know there are Rust bindings to the actual C++ library that can be used [here](https://docs.rs/rocksdb/latest/rocksdb/).

<sup>2</sup> - I'm playing fast and loose with the term database here since again, nothing is actually persisted. Still I think its fair to call, conceptually, what I've built a database. Not a production ready one by any stretch of the imagination, but still a database.

<sup>3</sup> - This is purely due to my own inability to get `tonic` to play nice with HTTPS. I know it is very possible but I just couldn't get it working so I have tabled it for now.

**The Code**

For anyone interested in reading the actual code written it is [here](https://github.com/jtk5aw/raft-implementation). The directory `raft` is a Rust workspace (🦀) containing several different crates and some shell scripting for SSL certificate creation. The files that are good starting points are in `risdb` and are `src/server.rs` and `examples/test_call.rs`.

