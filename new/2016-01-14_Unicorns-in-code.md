<!---work,architecture,programming-->
# Unicorns in software architecture

Most small to medium sized development teams produce a lot of what I like to call Unicorns. 

## What is a Unicorn?

Unicorns are created when each developer in a team has his or her own conventions and patterns that they like to follow. Even simple, similar task, are done widely different in different parts of the code base.

Ever read code where suddenly instead of `IRepository` you are greeted by `IStorage`? Even if data access seems to be done by implementations of `IRepository` in other places of the product? Ever been looking for a service only to find that all business logic is mixed with data access code in a repository? 

These are Unicorns, unique and often special was to solve the same typ of issue. The problem is that in terms of code quality this phenomenon is not good.

## Then why does this happen?

While not a fact, my experience tells me that code quality is seldom prioritized by smaller companies. There is usually not enough of a budget and sales depend heavily on new features to close deals.

This in turn leads to feature craze where solid engineering practices are sacrificed for features and quick hacks. Unfortunately the people that excel at this sort of work are often not so keen on creating robust code, they like working quickly and with many features. 

In a work environment where features are important they get top positions and engineering becomes a second class citizen that is taken care of way to late.

If you are really lucky your team might have a code review stage before commits are allowed into the main branch. Some kinks might be caught in such a stage but far from everything.

Add to this the speed most of these teams are forced to perform at and you have a breeding ground for Unicorns. 

## What can we do then?

Generally speaking, a solid and well thought out architecture begets good code. That is code that can be reassoned about, where behaviour can be predicted and above all that is uniform, both in structure and in style. 

For code to be uniform there has to be some set of conventions that the code follows. But conventions in place is not enough for producing good code. Following conventions produces code that has a uniform style. This is very important for navigating within a file or finding a file.

If, for example, all your fields are always at the top of your classes then you know where to look for them. The possitive effect of conventions is additive. Even if each convention by it self does not improve quality significantly. A lot of conventions governing everything from file names, file paths, commenting, code formating and naming, suddenly form a base for producing code where there are few discrepancies in style.

Uniform style is not enough though.   In order to make developers really familiar with the code another team member produces it also needs to be uniform in structure. This is achieved by having a solid architecture in place. 

Where conventions governa layout, architecture acts as a guide for how to structure logic. This means that without knowing all intricacies of a particular area you still know where to look in order to find things like data access, business logic and APIs.

## Architecture is hard!

There are probably other notions of architecture that can have large impacts on the development process of your team. Microservices and what not comes into mind, but I mean architecture on a lower level than that.

Do you follow some sort of industry standard, for example MS-standards? Do you use DDD? Maybe you follow some sort of in house architecture. Are there any patterns that are forbidden?

Whatever the case may be, the architecture that is chosen has to cover the needs of your team. The problem is that not all needs are known before hand. It is paramount that when new needs arise that the architecture is expanded and whatever changes you have made are communicated to the rest of the team.

Otherwise developers will solve issues without any sort of restrictions on how they can structure their logic. The next developer that comes across the same sort of problem might solve it differently and then you start the development of Unicorns!
