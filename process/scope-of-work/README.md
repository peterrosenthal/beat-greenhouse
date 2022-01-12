# Scope of Work
## Overview and Objectives
Beat Greenhouse is a videogame/experimental interaction where the concepts of plant breeding and cultivation are combined with music creation.

I first started working on this concept more than a year ago actually, as my final project for the ATLAS class Creative Code. The time was limited, and so my scope was small, but that project is when I first got acquianted with the MusicVAE (variataional autoencoder) from Google's Magenta.js package, and I used it to develop my very first prototype of "breeding" two melodies together using machine learning.

Almost a whole year later, I picked up the concept again with another final project for an ATLAS class, this time it was Game Audio. This second project to follow up the Beat Greenhouse concept gave me the opportunity to do something I had always wanted to do since the beginning of the concept: create a way to make generative plants out of the same music that we are "breeding." This would tie the music to the plants and then not only would you be "breeding" music, but you would also be cultivating plants at the same time! Once again, time, and thus the scope of the project, was limited, and I couldn't actually put anything into a greenhouse, so everything was stuck in a boring website-like interface. On top of that, I ran out of time at the end of last fall, and the plants weren't anywhere close to as pretty or interesting looking as I had hoped... they were actually just differernt colored twigs with more or less twigs coming off the side of them.

As the concept stands now: I want a first person player to navigate a 3 dimensonal world, and that world is an infinite greenhouse (or maybe an infinite number of finite greenhouses to help you keep things organized). Those greenhouses are filled with plants that when the player selects one, plays a song that is actually the generative source of the plant. The player can then select two plants to breed together based on either the plant's appearance, or the song that it plays, or both. Breeding the plants together will then fill the greenhouse (or maybe a separate greenhouse for organization) with their offspring. And then the selective breeding process can proceed again using the best and favorite offspring of the batch. This repetetive selective breeding process across multiple iterations is quite literally one of the most classic ways that we as a human species have cultivated the genome of many plants around us to create the delicous and wonderful foods and flowers we have today. Imagine the possibility of music that has been cultivated in the same natural kind of way!

As it stands, there are 4 major development hurdles/objectives that have to be overcome in order for me to get a properly enjoyable result out of this concept.
1. The plants that are generated need to be *cool*, *pretty*, and *interesting* enough to engage the audience, and really give them the immersive feeling that they are breeding (possibly very alien) plants.
2. The plants need to be placed in an immersive greenhouse setting with a first person character that actually interacts with them. I want it to feel like a game, not like a weird website.
3. In order to integrate easily into the rest of the digital music creation process, the Beat Greenhouse also needs to be able to import and export MIDI files. This would ideally be some game element, but it might just end up as some boring UI element.
4. Not everything can be a game element though, and there does have to be some level of user interface, and it has to be *good* because the user needs to have pretty good control over the "breeding" algorithm that actually happens if they want to maximize how well the game works in terms of giving them musical (and visual) results they enjoy. So there has to be a UI that makes these controls easy to understand and quick to use.

## Advisor Meeting Times
I would like to have weekly meetings to check in with my advisor, Matt Bethancourt, as long as that would work for him as well. The meetings will happen on __________(some day of the week) at ______(approximate time). The meetings will occur __________(in the Whaaat?! Lab or on Zoom?).

## Deliverables
First, and the most important deliverable to me personally, I will be delivering a "process log" at the end of semester that contains weekly written updates about what I have accomplished in the past week, how I accomplished it, and much more! In each and every process log update, I will measure progress by comparing my actual state of working on the project to the predicted timeline below, and hopefully I wont be too far off. These process logs will also contain plenty of gifs and screenshots of the project along the way, making my video at the end much easier. I plan on updating the process log on Friday evenings, after I've done all the work I want to on that Friday. That means that my "work week" scedule goes from Saturday to Friday every week. The exceptions are this first week, which is starting on Monday, because I didn't do any work the weekend before the semeseter started, and the last week, which ends on Thursday, because that's the last day of class.

Speaking of video at the end of the semester, that's the second deliverable. I believe some kind of video is required to wrap up the project, though I'm still not 100% sure what kind of content is expected to go in the video. I'm considering creating two videos, one that covers the development process of the project, and one that acts as a solid/cohesive game trailer for the project. There's also a good chance that those two topics will get combined into one single video though.

And the final deliverable, both in the order I'm bringing it up and also in the level of importance in how *good* it actually is at the end of the semester, is the Beat Greenhouse game itself. One thing that I've learned from my few years now at ATLAS is that when you're trying to create these wild and experimental projects, the easiest (and pretty much only) way to fail is to set too high and too strict of expectations for myself. If "experimental" is in the nature of the project, then by definition, "flexible" has to be in the nature of how I approach the project. I can't really know what to expect from it, but that's something that I need to accept.

## Timeline
Even though I have a relatively good idea of what I'd like to accomplish, and I even have previous progress on the concept of this project, I still feel like the path forward is a *little* bit volatile. And because of that, my predictided timeline is probably going to be a little bit more accurate at the beginning than at the end, and probably a lot more accurate at the end than during the middle of it all. So I wont be too had on myself if I'm not actually accomplishing the same tasks as I predict I will be, especially in the middle of the timeline, and double especially if it is due to a (realistically relatively slight) change in creative direction to the project.

The general predicted timeline for this project is as follows:
* **Week 1**: January 10 - 14
  * Create the scope of work document.
* **Week 2**: January 15 - 21
  * First week of development.
  * Create a new plant generation system from scratch, what I learned from the last one is that it's not the right path and I need to take a new one!
  * Idea to look into: content/neighborhood aware L-systems.
* **Week 3**: January 22 - 28
  * Continued development of plant generation system.
* **Week 4** : January 29 - February 4
  * Continued development of plant generation system.
  * Idea to look into: different kinds of plants (grasses, trees, cacti)?
* **Week 5**: February 5 - 11
  * Finish making the plant generator look pretty.
  * Idea to look into: flowers and other plant accessories.
* **Week 6**: February 12 - 18
  * Create the first person controller and start working on the surrounding greenhouse.
* **Week 7**: February 19 - 25
  * Continue working on the greenhouse and other environmental surroundings.
  * Idea to look into: what are the plants *in*? Clay pots? The ground?
* **Week 8**: February 26 - March 4
  * 50% of main development checkpoint.
  * By this point there should be:
    * Cool looking plants
    * Tied to songs
    * In a greenhouse
    * That is navagigable by a first person controller
  * This is honestly pretty much what I would consider project MVP, assuming that a minimal (but bad) UI has been developed along the way.
* **Week 9**: March 5 - 11
  * Start developing a good, usable, and understandable UI to control things such as:
    * Which two plants are being bred together?
    * Which greenhouse are we in? (if I decide to go the multiple greenhouses route)
    * What kinds of songs are we breeding? (i.e. drums, or short melodies, or long melodies)
    * How similar should the children be to their parents and to their siblings?
    * How many children should be created?
    * And many more controls over the breeding and cultivating process.
* **Week 10**: March 12 - 18
  * Continue development on the UI.
* **Week 11**: March 19 - 25
  * Continue development on the UI.
  * Incorporate MIDI import into the "good" part of the UI. I likely will have roughed this in much earlier because it was present in previous projects of the Beat Greenhouse concept, but I'm going to try to hold off on wasting the time to make it actually "good" until later on, so I can dedicate the earlier time to more important aspects of the project.
* **Week 12**: March 26 - April 1
  * Continue development on the UI.
  * Now is probably the time to work on incorporating MIDI export into the UI.
  * Idea to look into: MIDI import and export as game elements instead of UI elements?
* **Week 13**: April 2 - 8
  * This is extra time to allow me to catch up on development of the project, and maybe even get a head start on the video(s). No specific milestones to call out for this week.
* **Week 14**: April 9 - 15
  * Finish main development of project.
  * Final tweaks and finishing touches are okay from here on out, but absolutely no major development as most of the remaining time needs to be saved for videos.
* **Week 15**: April 16 - 22
  * Start creating video(s).
  * Idea to look into: two videos or just one?
* **Week 16**: April 23 - 28
  * Finish creation of the final video and/or game trailer.
