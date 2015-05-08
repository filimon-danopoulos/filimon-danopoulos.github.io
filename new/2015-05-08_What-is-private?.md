<!--programming-->
# What is `private`?

I was working with an issue in an Angular application written in TypeScript,
and since I have just re-read the wonderful book [Clean Code](http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882/),
I decided to write the domain logic in TypeScript objects instead of Angular services.

During the implementation I had (prior to refactoring) an object with two factory
methods and a couple of private set methods, similar to this:

    class Example {
        private field: number;

        private setField(value: number) {
            // validation logic
            this.number = number;
        }

        public static createInstance(value: number) {
            var instance = new Example();
            // logic
            return instance;
        }
    }

I was facing a dilema of making `setField` public so that I could call it from the
factory method or rewriting the code to utilize inheritance. For entirely different
reassons I later decided on the inheritance path, but before I came to that conclusion I
tried getting the first approach to work.

## I learned something new!

The first thing I did was just to add a call to `setField` in the factory method:

    public static createInstance(value: number) {
        var instance = new Example();
        instance.setField(value);
        return instance;
    }

I made another unrelated change and compiled, to my big surprise I had no errors.
First I thought this was a TypeScript oddity so I added the following after the class:

    var temp = new Example();
    temp.setField(42);

This did not compile since `setField` is private, as expected. Now I wanted to know
if this was TypeScript specific so I tried the following C# example:

    using System;

    public class Program
    {
        private void Log(string message)
        {
            Console.WriteLine(message);
        }

        public static void Main()
        {
            var instance = new Program();
            instance.Log("Hello World");
        }
    }

Sure enough this compiles and runs properly. So does the following Java code:

    public class Program {
        private void Log(String message) {
            System.out.println(message);
        }
        public static void main(String[] args) {
            Program instance = new Program();
            instance.Log("Hello World");
        }
    }

Thinking back on it this makes at least some sense. I have previously made `private` synonymous
with _in this class only_ which removed almost all cases where a private method
would be called via `instance.methodName()` from my mind. I would always call
private methods via `this.method()` or straight up `method()`.

This particular feature really comes in handy when creating static factory methods
and similar functions that act on an instance of one self, so I am glad I learned about this.
I really enjoyed finding this since it taught me something pretty fundamental that I probably
should have known already.
