---
title: 'Using GenAI'
pubDate: 2025-01-30
updatedDate: 2025-01-30
description: 'My own frustrations with GenAI.'
author: 'Jackson Kennedy'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'The full Astro logo.'
tags: ["ai"]
---

I've been pretty consistenly anti generative AI in its short time in the spotlight. Hallucinations were a dealbreaker for me. On some initial use of some LLM (I've forgotten which at this point) I asked for book recommendations from a specific author. I got back a list of books that I hadn't heard of before! I went to look them up and they just weren't real. Not close to an existing book. Not written by a different author. Just completely made up.

That experience initially left me jaded and made me avoid LLMs more than I should've. What started to bring me back was trying Vercel's [v0](https://v0.dev/). With like a three sentence prompt and got back a completely functioning UI. That was sick. I didn't ship anything with it, but it did open my eyes that I was definitely missing out on something cool avoiding LLMs altogether. I've committed a little harder to using LLMs for other stuff and frequently ask it for code samples or solutions to borrow checker problems. Claude has been my go-to model so far. 

But still, an LLM like Claude can't break apart new problems on its own. It doesn't feel intelligent. I'm still using it mostly as a glorified search engine which it is fantastic at. It is incredible how easy it is to ask a question to Claude and get a specific (and real) answer at this point. But the question you're asking has to be answered somewhere already. It has to have reference points. That makes it amazing for things like what [v0](https://v0.dev/) does. I see so much talk on twitter though about how this is set to replace jobs *soon*. The way its discussed, *soon* seemingly means within months. 

The experience for me that prevents me from buying into the superintelligence hype was using Claude 3.5 Sonnet for [Advent of Code](https://adventofcode.com/) [day 21](https://adventofcode.com/2024/day/21). Oversimplified, the crux of the problem is about determining the sequence actions should be taken in (i.e should you move left or right first? what about right or up?). Unassisted, I could get to the correct ordering but for the life of me I could not understand why it was the right ordering. I read multiple Reddit posts explaining the logic but it just still didn't make sense to me. My hope was Claude would be able to get me those last few steps. I figured if I explained the problem, the answer and gave examples Claude would be able to give a satisfying explanation. Or, just give me enough information that I could then solve the problem myself. But for the life of me I just couldn't get it to give me an answer. It would either make up information altogether or just kinda :shrug: at me.

I want to work with an LLM that is smarter than me. An actually intelligent LLM that can actually provide explanations to problems without a predefined answer sounds incredible. But from my experience it just is not there yet. That gives me pause for how close it could actually be to something superintelligent. Maybe I'm just using the wrong model, I haven't had the gumption to test drive 10 different models. They come out faster than I can keep up with. So maybe this is still just me being behind on the actual state of the art. But for now the claim to me that an LLM is intelligent just doesn't land with me. 

