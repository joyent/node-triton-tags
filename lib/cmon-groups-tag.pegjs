tag = first:group rest:("," group)*
{
    var all = rest.map(function (n) { return (n[1]); });
    all.unshift(first);
    return (all);
}

group "Group" = [a-zA-Z0-9\-\_]*
{
    return (text());
}
