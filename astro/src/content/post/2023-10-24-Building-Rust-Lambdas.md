---
title: 'Building Rust Lambdas'
pubDate: 2023-10-24
updatedDate: 2023-10-24
description: 'Post about writing Lambdas in Rust.'
author: 'Jackson Kennedy'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'The full Astro logo.'
tags: ["rust", "lambda"]
---

In late 2022 Rust had start to come up in conversations at work and  online. Looking into it more I decided to dive into learning it. At the same time, I also wanted to try and build a website on AWS so I decided to kill two birds with one stone. I made a React site backed by an API running Rust lambdas; I decided to build this all using CDK. To make changes to the backend of the site I would compile and package the Rust code I'd written, then run `cdk deploy Service`. There were some different stages to this "compile and package the Rust code I'd written" step that I feel are worth writing about here. 

#### Single Lambda Crate ([Repo Checkpoint](https://github.com/jtk5aw/random-image-site/tree/16292677aee507dbff537c94a03d854320e33c55))<sup>1</sup>

Running a Rust Lambda requires using a custom Lambda runtime. All this means is Lambda will execute the `bootstrap` executable in whatever zip file you provide it. That `bootstrap` executable must follow a specific API but most of those details are abstracted away by the crate [aws-lambda-rust-runtime](https://github.com/awslabs/aws-lambda-rust-runtime)<sup>2</sup>. So all I needed to get up and running was create my own lambda in a crate that uses on aws-lambda-rust-runtime, compile my Rust code to the right target, name that executable `bootstrap`, and then zip it up for a CDK deployment. 

Sadly, I was still developing on Windows so cross compilation to Linux was possible yet somewhat annoying. I decided to use the tool [cross](https://github.com/cross-rs/cross) since I already had Docker installed. With this, I could run the following command in my lambda crate. 
```shell
cross build --release --target x86_64-unknown-linux-musl
``` 
Then I would have to copy the created executable into a new directory with the name `bootstrap`. The executable had to be the only file in the directory so that it could be properly zipped by Lambda. This directory also had to have a hard coded name so that whenever a CDK deployment was run it could look in the same place. 

#### Two Lambda Crates ([Repo Checkpoint](https://github.com/jtk5aw/random-image-site/tree/75d28168a54341fe226dcddbd08c51944daeee7d))

To add more functionality to the site I decided to add a second Lambda. To do so, I added a second crate that for the new lambda. This complicated the compilation and packaging step as it now required compiling in two different crates. It also meant that there was some shared Rust code that I wanted to use in two different crates. 

The solution to the first problem was to just run the same command as before, now twice, every time I wanted to run a new deployment. This was tedious and easy to mess up but I was able to convince myself that this was "better" because it let me deploy changes to only one Lambda at a time. Recall that this location has to be referenced by CDK as well, so for each Lambda I have to make sure its executable is manually copied into a directory with a specific name. 

The solution to the second problem was creating a third crate that the two Lambda crates would reference via local imports. This is a *somewhat* frowned upon method of doing imports from what I can tell in the Rust community. This is mostly because it makes it impossible to publish to crates.io without changes or conditional logic in crates.toml. Since I have no plans/desire to do this, this works just fine for my use case. 

#### Cargo Workspace ([Repo Checkpoint](https://github.com/jtk5aw/random-image-site/tree/fcff5dd556edd8a07d40348899da1821339fc3f1))

Eventually I came to my senses and realized that running a compilation step in several different crates manually was not worth it. I discovered that cargo workspaces existed and was able to put all the Lambda crates **and** the shared code crate in this workspace. Now, I could compile both Lambdas and all their shared code at the same time. At this stage I did still have to do the manual copying of executables into directories with hard coded names. 

#### Cargo Lambda ([Repo Checkpoint](https://github.com/jtk5aw/random-image-site/tree/9e8a1bbe8884cc7c9f018c19659bca1920ce3a27))

The final stage of this project for managing these Rust lambdas was to use the tool [Cargo Lambda](https://www.cargo-lambda.info/). It is purpose built for exactly what I'm trying to do and understands the ins and outs of compiling and packaging for Lambda in Rust projects. With this tool, one command can be run that both compiles and copies all the executables into a directory with the name `bootstrap`. And now, the name of the directory for all these executables will be the name of the crate itself, not whatever hardcoded string I had decided on. I had also swapped to a Mac development environment at this point which made this somewhat easier<sup>3</sup>.

The command to build all the lambdas from my cargo workspace was as follows. 
```shell
cargo lambda build --release --arm64
```
You'll notice the `--arm64` flag. Since I was now on a Mac compiling for Arm was easy to do and since Graviton is cheaper I figured I might as well go this route. 

#### Conclusion

I'm pretty happy with how easy it is to deploy backend changes for this site today. I know that some form of CI/CD is certainly possible but I don't feel its necessary for a personal project of this size. I'm also aware that Cargo Lambda actually has the ability to deploy lambdas directly, but since I have other aspects of my project controlled by CDK I figured centralizing all infrastructure deployments in one place was the better path. 

The full github link for this project exists [here](https://github.com/jtk5aw/random-image-site/) and the site itself (should) exist [here](https://jtken.com), feel free to check it out. 

## Footnotes

1: You don't have to look all the way into the code at each of these checkpoints but, if nothing else, checking the directory structure will provide some insights. 

2: If you follow that link you'll get a sneak preview of the tool this post ends up with. 

3: I have a vague recollection of trying to get Windows to play nice with Cargo Lambda and failing to ever get it up and running. I don't remember all the details though so they are left out for the most part. 