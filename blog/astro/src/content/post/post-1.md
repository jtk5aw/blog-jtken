---
title: 'My First Blog Post'
pubDate: 2023-11-22
updatedDate: 2022-11-22
description: 'On Astro.'
author: 'Jackson Kennedy'
heroImage:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'The full Astro logo.'
tags: ["astro"]
---

I'm setting up this blog because I have some things I'm hoping to write about soon and wanted a place to put it. Before this I've had two different blogs, one on GitHub pages and then one running Wordpress hosted on AWS Lightsail. The former lasting me a few years and two blog posts and the latter lasting me about 3 weeks and a single blog post. Coming back to GitHub pages after a few years I got frustrated being unable to debug changes not showing up. Then, after moving to the Wordpress blog it had too many small UI issues that I couldn't easily tweak. So, I abandoned both and decided to start from scratch with Astro. 

In reality, with some effort I probably could have made either GitHub pages or Wordpress work. But, here we are, not having done that. [Astro](https://astro.build/) seemed to fit the bill for giving me control while also taking care of the things I didn't want to worry about (very specific I know). Plus it just seemed neat. And then for hosting it, [SST](https://sst.dev/) supposedly would "just work". Plus I had seen it brought up on twitter **a lot** so I wanted to mess around with it. 

Overall, I'm happy with how this ended up going. [Astro](https://astro.build/) is powerful enough to get out of my way but not so overbearing with defaults that I couldn't make little tweaks that I wanted. I think it'll be easy to make new posts and also to change the styling/layout in the future if I so desire. As far as [SST](https://sst.dev/) goes I was super pleased. My opinion whenever I'd seen it had been very much been why not just use CDK yourself? The value of higher level CDK constructs didn't seem *that* useful. But, for getting this site off the ground it took care of all the annoying bits without a problem. Once I got the code to "compile" locally it deployed just like I wanted it to. Didn't have to worry about CloudFront, ACM or anything like that. Which I loved.<sup>1</sup>

For now I'm ready to keep messing around with the site. I would like to make the style of the posts and the landing page a little bit more my own as right now I'm using all the default stylings. But that will be handled later.

Blog Repo Link: https://github.com/jtk5aw/blog-jtken

<sup>1</sup> - I also messed around a little bit with the hot reload feature for testing APIs. That was impressive to say the least and I would love to play around with it a little more.