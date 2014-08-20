In this post I will discuss some of the steps involved in coding the generation of the static pages that this blog is composed of.

## The Design

My approach to this little project is code first, think second. That usually doesn't work out so good, but considering that I will probably not write more than a couple hundred lines of code that should probably not be an issue.

I knew for certain that I wanted to use markdown for writing posts, I also knew that I didn't want to use JavaScript. I love JavaScript don't get me wrong, I just think it is a bit over used. A site composed of static resources doesn't need JavaScript for anything. So, no JavaScript.

The decision to use Linux tools had already been made so my tools set was well defined. Working with text files in a Linux environment is super nice since the entire OS is based around text files. 

Next up was finding a markdown compiler. I run Manjaro, an Arch based distro, so the first thing I did was run `pacman -Ss markdown`. I did not have to do any more searching since that found me the package `markdown`, that does exactly what I want.

## First Try

Speed was the primary concern so I went for a monolithic approach. I created a folder `posts` for the markdown files and a single script file `generate`. The script included all the required HTML as strings and depended on appending strings and compiled markdown in a precise order to generate a valid HTML file.

The heart of the script was (and still is) a loop that itterates over the result from `find "posts/" -name "*.md"`. It saved the path in a variable called `$þostSource` and later compiled and appended the markdown via `markdown "$postSource" >> index.html`.

I wrote two test posts and started working with the Bootstrap classes on the HTML strings. This clearly wasn't going to work, not a surprise really.

## Second Try

The HTML strings had to go so I broke them out into template files and stored them in a folder, `templates`. This was done crudely, that is I created two parted template files. That way I didn't have to change my script layout too much, I only hade to change `echo "..." >> index.html` to `cat "template/..." >> index.html`.
 
This small change made it possible to add Boostrap classes and modify the HMTL freely, since I could now edit a formated HTML file. I did some experimenting and decided on a simple [panel](http://getbootstrap.com/components/#panels) based layout.

First "real" post was written (Hello World) and put online, read it [here](/posts/2014-08-16_Hello-World.html).

## Third Try


