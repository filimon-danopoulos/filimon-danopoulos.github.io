<!--programming, gotchas, work, csharp-->
# Copying objects

Today something weird happened at work. A couple of weeks ago I updated a caching solution to return a copy of the cached object since we
had a couple of issues with mutation of the cachee. When I got in to the office today I had a mail in my inbox that pointed to said commit 
and claiming it was the culprit of an issue with some values turning up as 25.0 instead of 25.

We had previously experienced issues with locale so I assumed that some locale-specific value got cached and depended on mutability to
function correctly. After pursuing that lead for a while I didn't feel it. So I looked for other alternatives.

In order to create true copies of the objects I used JSON serialization/deserialization. As it turns out, Json.Net always serializes doubles
with a decimal. So when we serialized an object with a decimal value the deserialization yielded a different decimal value than what was originally 
saved in the cache.

We eventually solved it by writing a custom decimal formater that didn't append ".0", an interesting gotcha don't you think?
