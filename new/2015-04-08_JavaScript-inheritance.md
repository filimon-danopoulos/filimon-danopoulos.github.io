<!--programming,javascript,web-->
#JavaScript inheritance and "classes"

Since I have not written anything in a long time I decided to start again on a fairly easy topic.
So in this post I will give my insights to JS inheritance and the "class" system, however slim they may be.


## Why "classes"?

You might wonder why I write "classes" instead of classes (no quotes) in the context of JavaScript.
Well it is easy, JavaScript has no classes in the conventional sense, it has prototypes. A lot of
people try to find comfort in something familiar and call constructor functions classes but as you will see this
is somewhat wrong and actually misleading in a lot of ways.


## The basics

I will briefly go over the basics so that we have a common frame of reference. This is far from in depth.
If that is what you are after check out [this](https://www.youtube.com/watch?v=PMfcsYzj-9M) YouTube video by
James Shore. It covers the topic well and is quite easy to follow.

### Constructor functions

The de facto pattern for class-emulation you will se when dealing with JS "classes" is the use of constructor functions:

    function Person(firstName, age) {
        this.firstName = firstName;
        this.age = age;
    }

    Person.prototype.getInfo = function() {
        return ["My name is ", this.firstName, " and I am ", this.age, " years old."].join("");
    }

    var filimon = new Person("Filimon", 26);
    filimon.getInfo(); // returns "My name is Filimon and I am 26 years old."


This is somewhat familiar for a lot of people coming from class based OOP languages like Java or C#.

* It uses the `new` keyword.
* It declares something that is not an object literal (this is important as you will see later).
* It uses `this` another keyword that seems familiar and leads to **the** JS gotcha, but that is another post entirely.

Aside from being hideous to look at this is very confusing from a logical point of view. Luckily there is a better way.

### The joy of `Object.create`

Leveraging the fact that JavaScript has prototype based inheritance (more on this in a while) we can do this instead:

    var Person = {
        init: function(name, age) {
            this.name = name;
            this.age = age;
            return this;
        },
        getInfo: function() {
            return ["My name is ", this.name, " and I am ", this.age, " years old."].join("");
        }
    }

    var filimon = Object.create(Person).init("Filimon", 26);
    filimon.getInfo(); // returns "My name is Filimon and I am 26 years old."

This feels alien to non-JavaScript devs due to the following :

* It uses object literals as prototypes. Then whole "instances" are created from "instances" thing
feels weird when you are used to classes in Java/C#.
* It does not have a constructor, creating and initialization are two separate steps.
* It does not use a keyword for object instantiation, it seems weird to construct things without `new`.
* It uses `this` in a way that seems awkward when you are used to classes.

Even if this seems strange, under the covers it is more or less the same thing as the constructor function approach.
In the constructor function example the prototype is explicit `Person.prototype`. In this example,
the prototype of `filimon` is set to `Person` via `Object.create`.
The constructor part of the constructor function example is equivalent to the `init` method.
Refer to the YouTube video above for a detailed explanation of this.

### EcmaScript 6 classes

In the upcoming version of JavaScript a new keyword `class` is introduced.
This adds a layer of syntactic sugar to the constructor function based approach.
The running example would be written like this:

    class Person {
        constructor(name, age) {
            this.name = name;
            this.age = age;
        }
        getInfo() {
            return  `My name is ${this.name} and I am ${this.age} years old.`;
        }
    }

    let filimon = new Person("Filimon", 26);
    filimon.getInfo(); // returns "My name is Filimon and I am 26 years old."

This is basically equivalent to the constructor function approach,
in practice it differs only in the use of string interpolation and `let`.
There are huge benefits compared to constructor functions as far as inheritance is concerned, more about that later.

Obviously this is syntactically what most OOP programmers from a Java/C# background might expect.

I will show how ES6 classes look in the coming examples, for completeness sake.
This post will mainly cover ES5, as I believe that is the hard part, so I will just briefly cover ES6.


## Inheritance

Inheritance in JavaScript is extremely powerful, but a bit inaccessible for beginners. In order to understand it you have to understand
how JavaScript resolves properties and methods, enter the prototype chain.

Explaining this in detail is outside of the scope of this post (it's long enough already),
but the above linked video explains it well. The gist of it is that all objects in JavaScript have a prototype property,
if the requested property (or metohd) is not found on the actual object,
it will check that objects prototype for the property, if it is not found it will traverse the prototype's prototype and
so on until a `null` prototype is encountered.

I will now continue with the running example and add inheritance into the mix, I will also overload `getInfo`.


###  Constructor function

Since this is the by far most used OOP construct I will start with it. Coincidentally it is the most convoluted and hardest to understand.
I will create an `Employee` constructor that inherits from `Person` to showcase inheritance.

    function Person(name, age) {
        this.name = name;
        this.age = age;
    }

    Person.prototype.getInfo = function() {
        return ["My name is ", this.name, " and I am ", this.age, " years old."].join("");
    }

    function Employee(name, age, employer) {
        this.super.call(this, name, age);
        this.employer = employer;
    }

    Employee.prototype = Object.create(Person.prototype);
    Employee.prototype.constructor = Employee;
    Employee.prototype.super = Person;

    Employee.prototype.getInfo = function() {
        return [this.super.prototype.getInfo.call(this), " I work at ", this.employer].join("");
    };

    var filimon = new Person("Filimon", 26);
    filimon.getInfo(); // returns "My name is Filimon and I am 26 years old."

    var employedFilimon = new Employee("Filimon", 26, "Danopoulos Inc.");
    employedFilimon.getInfo(); // returns "My name is Filimon and I am 26 years old. I work at Danopoulos Inc."

If you don't know JavaScript, this is straight out impossible to understand. So let's break it down, the important rows are:

    Employee.prototype = Object.create(Person.prototype); // #1
    Employee.prototype.constructor = Employee;            // #2
    Employee.prototype.super = Person;                    // #3

Line by line these do the following:

* **Row #1** This couples `Employee` with `Person` through `Employee`'s prototype property,
this is what makes inheritance possible. Remember that JavaScript traverses prototypes in order to find properties,
so when set it up this way, if any property missing from a "sub-class" it will be looked for in the the parent "class".
* **Row #2** All JavaScript functions have a prototype that has a `constructor` property that point to the original function.
Before this row is executed `Employee.prototype.constructor` is `Person`, since we took all properties from `Person.prototype`.
This make no difference as far as JavaScript is concerned. Everything will still work unless you have code that relies
on the `constructor` property being "right". So I have this row to set the value to the expected `Employee`.
* **Row #3** This is not a standard way of doing this, usually the "sub-class" constructor and all methods that require the
parent "class" will explicitly call the parent, in this example:

        function Employee(name, age, employer) {
            Person.call(this, name, age);
            this.employer = employer;
        }
        Employee.prototype.getInfo = function() {
            return [Person.prototype.getInfo.call(this), " I work at ", this.employer].join("");
        };
However I think this couples the code to hard an I am therefore adding a `super` property to loosen that coupling.
We can now call the parent constructor via `this.super` and any parent method via `this.super.prototype`.

Method overloading is achieved to simply overriding the method name, since we have provided a `super` property we can
call the parent's method via `this.super.prototype.getInfo.call(this)`. As I previously pointed out `this` is a major
issue for newbies in JavaScript. In this case, `this` has to be specifically bound via `.call(this)`,
since we access the method directly from the prototype of the super "class". It would default to window if we didn't do this.

I will leave it at that for now, since I think the code makes my point (that this method is awkward and hard to comprehend) well enough.
Luckily using objects and utilizing the prototype chain makes it a lot cleaner and easier to read.

### Prototype based inheritance

Following the second example from the first section, using prototype objects and `Object.create` inheritance is a lot cleaner.
I have modified the base "class" slightly in order to make the code more uniform. Instead of assigning the properties and creating
the object simultaneously. I make `Person` inherit from `{}` and assign the properties and methods to the `Person` object.

    var Person = Object.create({});
    Person.init = function(name, age) {
        this.name = name;
        this.age = age;
        return this;
    };
    Person.getInfo = function() {
        return ["My name is ", this.name, " and I am ", this.age, " years old."].join("");
    };

    var Employee = Object.create(Person);
    Employee.super = Person;
    Employee.init = function(name, age, employer) {
        this.super.init.call(this, name, age);
        this.employer = employer;
        return this;
    };
    Employee.getInfo = function() {
        return [this.super.getInfo.call(this), " I work at ", this.employer].join("");
    };


    var filimon = Object.create(Person).init("Filimon", 26);
    filimon.getInfo(); // returns "My name is Filimon and I am 26 years old."

    var employedFilimon = Object.create(Employee).init("Filimon", 26, "Danopoulos Inc.");
    employedFilimon.getInfo(); // returns "My name is Filimon and I am 26 years old. I work at Danopoulos Inc."


First of, this code is shorter and a lot clearer. There is no "magic" involved, no assignments to a prototype
or anything quirky like that. The main issue with this code is that it is alien for traditional OO
programmers, so anyone coming to JavaScript from another language will probably opt for the similar approach.

Let's break this code down and draw some parallels to the constructor based approach. The important part are these two rows:

    var Employee = Object.create(Person);
    Employee.super = Person;

The first row achieves the same as the following from the constructor function example:

    Employee.prototype = Object.create(Person.prototype);

The second row sets up the `super` property that this row achieves in the constructor function example:

    Employee.prototype.super = Person;

The most important thing to note is that there is no longer need for any assignment to `.prototype` as `Person`
**is** our prototype and there is no constructor function so the `constructor` property does not have to be defined.


### ES6 classes

    class Person {
        constructor(name, age) {
            this.name = name;
            this.age = age;
            return this;
        }
        getInfo() {
            return `My name is ${this.name} and I am ${this.age} years old.`;
        }
    }

    class Employee extends Person {
        constructor(name, age, employer) {
            super(this, name, age);
            this.employer = employer;
        }
        getInfo() {
            return `${super.getInfo()} I work at ${this.employer}`;
        }
    };


    var filimon = new Person("Filimon", 26);
    filimon.getInfo(); // returns "My name is Filimon and I am 26 years old."

    var employedFilimon = new Employee("Filimon", 26, "Danopoulos Inc.");
    employedFilimon.getInfo(); // returns "My name is Filimon and I am 26 years old. I work at Danopoulos Inc."
