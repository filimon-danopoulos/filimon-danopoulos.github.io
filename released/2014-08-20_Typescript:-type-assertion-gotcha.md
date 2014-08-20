# Typescript
 
Typescript is Microsoft's attempt at a statically typed superset of JavaScript, and they have done quite a good job. One of my biggest issues with JavaScript is the lack of good IDEs. Since I am a C# developer I am used to the tooling of Visual Studio, I always missed that in JavaScript. One of the side effects of having a static typing is that a lot of tooling becomes possible, so that is nice.

That aside, the main point of having static types is that code is verified at compile time. That way a lot of bugs that happen in JavaScript are eliminated entirely. If you are interested in this you can read more [here](http://www.typescriptlang.org/Handbook). 

Another nice thing that Typescript provides is EcmaScript 6 style classes and inheritance. That means that we can define actual classes:

    class Human {
        // ...
    }
    
    class Female extends Human {
        // ...
    }


## It's only typed at compile time!

I recently started working with Typescript and I ran in to something that took me by surprise. To illustrate it mistake let's look at a simplified example:

    class A { }
    class B extends A { }
    class C extends A { }
    
    var x = <A> new B();
    var y = <C> x; 

In Typescript `<T>` is called a type assertion, if you search for how to do a cast in Typescript this will probably be the result. Let's compare the Typescript sample to some C# code that does the same thing:

    class A {}
    class B : A {}
    class C : A {}

    class Program
    {
        static void Main()
        {
            var x = (A) new B();
            var y = (C) x;
        }
    }

The examples are very similar and both of the above samples compile. When you run the C# code you get an exception but when you  run the Typescript code there are no exceptions. I spent some time looking into why it didn't behave as I expected and after some digging I reallized my mistake. After looking at the JavaScript the compiler generates it was obvious that no type checks are done in run time. 

The thing is, when you have a syntax that is so similar to something you already know (C# in my case) your expecations are set accordingly. The Typescript documentation is clear that no run time checks are made (it's not even called a cast in Typescript), but during coding I fell back on subconsious patterns.

If you spend some time looking at Typescript and the compiled JavaScript you quickly see that they are very similar, in a lot of cases the only difference is type anotations in the Typescript code. This seems to be very much by design, see [this post about let and const](https://typescript.codeplex.com/discussions/397633) for another example on the same note.

## Keep in mind

Remember that Typescript is not type safe, it's just safer than JavaScript. In the end Typescript compiles to clean regular JavaScript and will behave exactly like clean regular JavaScript: dynamic as shit!








