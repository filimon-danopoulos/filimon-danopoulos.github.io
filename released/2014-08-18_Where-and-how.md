<!--blog, web-->
# In search of a blog host

When I decided that I wanted to create a blog I started looking at different solutions for hosting it. My requirements were:

* It should be free, as in beer.
* I should not loose any copyright.
* It should be customizable, preferably by coding.
* It should be quick to set up.
* I should not feel like a dick for hosting the blog there.

I had some prior experience with [Blogger](https://www.blogger.com/) so my first thought was hosting the blog there. I already had a 
Google account so I created a new blog. All the different configurations, themes and layout options took a long time to work through. 
I didn't have the energy or time to configure it the way I wanted it so I decided to scrap it. The main point of having a blog was 
getting some writing done, I wanted something that would go online faster.

The search continued, Wordpress caught my eye but all the solutions I could find either required me to self host or get some 
kind of account. Another account that can get hacked, lost or whatever else can happen to accounts. No thanks I don't want that. 
It's a shame really, I have been looking for a reason to learn PHP for quite some time. 

The frustration was building as everything I could find was either not extensible enough, or to complicated to set up quickly. 
I considered just rolling my own (maybe learn PHP along the way) but decided against it since I didn't want to fiddle with hosting 
and webservers.

Then I remembered Github pages! A simple, no database, no cost and no maintenance solution for hosting a site. 
The required Github account was no issue since I had an account prior to the inception of this blog. My blog host was found.

## The components

The next step was getting something together that I could put online. The goal was a minimalistic no fuss site. 
I have previously used [txti](http://txti.es/) for writing different texts, it produces sites like 
[motherfuckingwebsite](http://www.motherfuckingwebsite.com). I wanted something a bit fancier so I 
went with a simple Bootstrap based site.

[Bootstrap](http://getbootstrap.com/) is a CSS framework that has some pretty nice components and has sweet support 
for responsive design. My main issue with Boostrap is that it has too many components, it's a bit bloated. 
It even has a jQuery dependency if you want to use some of the components. This is an issue for me since I am 
not going to run jQuery on this site and I want to keep the site as bare bones as possible.

With the visual component sorted out I had to find with a way to power the blog. 
Github pages are static, that means no server side programming is allowed. 
Luckily that is not an issue for a simple blog, since all content is static. It does however restrict the toolset for 
site generation quite a bit. There are tons of static site generators out there, I wanted something simple.

[jekyll](http://jekyllrb.com/) seems to be the go to answer in this scenario. After checking it out I decided it 
had too many features for me. Just generating a site is a fairly simple process, I should manage that myself. 
Linux is text-based so I had a myriad of text-editing tools available and I knew some of them quite well. 
The decision was made to build my own generation in BASH. This way I didn't have to learn loads of new 
things and should be able to get content produced without great delay.

All required decisions had been made so the next step was putting it all together. I am fairly certain 
that the path I decided to go down will not change drastically. So in the next write up I will summarize the 
different site generation components. 

The blog is obviously very young and I have a couple of changes that I want to do so I will hold of that 
post until I those changes. Stay tuned for updates and don't forget to smile!
















