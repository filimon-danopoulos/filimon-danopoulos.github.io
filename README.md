# My blog!

This repository contains my blog, check it out [here](http://filimon-danopoulos.github.io/)!
The main point of this document is to refresh my memory if I have to install it on another machine and
roughly document the components of the blog.

## Setting up

This blog has a couple requirements in order to function correctly.
First and fore most you have to install the markdown compiler by:

    $ sudo pacman -S markdown # for arch based
    $ sudo apt-get install markdown # for debian based

A functioning BASH environment is also a requirement. No other "strange" funtions are used.
The site generation is composed mainly of `cat`, `sed`, `mv` and `echo` calls, so it should
function on most Linux systems.

In order to publish anything `git` is required, get it by:

    $ sudo pacman -S git # for arch based
    $ sudo apt-get install git # for debian based

That probably covers all the dependencies.

## Running stuff

The site is managed and generated by a couple of scripts.

* `scripts/new`: Creates a new post given a name, and places it in the new folder. Strips a couple of charactes so that the file names follow a common convetion and adds a date-stamp.
* `scripts/generate`: Generates all the HTML content from the markdown files and combines it with the templates. This is what drives the entire blog.
* `scripts/publish-blog`: A helper script so that I can generate the blog and push it to Github in one step. Primarily called by a cron job.
* `scripts/release`: Moves a file from the `new` directory to the `released` directory and changes the time stamp.

Essential to the generation process are the HTML-templates.
They are located in the folder `templates` and contain everything that is not related to a post.
For example, the header and footer of each page and things like navigation.

## Writing

In order to write a new post navigate to the root folder of the project and run `./scripts/new "$postName" `
where `$postName` is what you want to call the post.
It will automagically open in Atom. When you are done writing, move the post to the folder `released`.
This folder includes all the posts that will be used during the site generation.
You might want to update the timestamp to reflect the date you released it rather the date you created it,
then you can run the script`./scripts/release "$fileName"` that moves the file and updates the timestamp.
