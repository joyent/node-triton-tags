tag = first:service rest:("," service)*
{
	var all = rest.map(function (n) { return (n[1]); });
	all.unshift(first);
	return (all);
}
service = name:dnslabel port:(":" int)? props:(":" key "=" value)*
{
	var svc = {"name": name};
	if (port)
		svc.port = port[1];
	props.forEach(function (pr) {
		svc[pr[1]] = pr[3];
	});
	return (svc);
}
dnslabel "DNS name"		= [a-z] [a-z0-9-]* 	   { return (text()); }
key "property name"		= [a-z] [a-z0-9-]* 	   { return (text()); }
value "property value"		= [^,:]+ 		   { return (text()); }
int "integer (port number)"	= [0-9]+		   { return (text()); }
