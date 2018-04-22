## serverbrowser

This is an attempt of creating a halo 3 eldewrito compatible server browser that just allows me to connect to a server and doesn't crash or hang every time.

It does this mainly by using React, who makes sure the server list is rerendered only when necessary, avoiding unnecessary DOM insertions. It also uses redux in order to keep server information on a reliable place, and ensures a server isn't pinged twice by accident.

Currently deployed [here](http://eldewrito-serverbrowser.s3-website-us-east-1.amazonaws.com/) (does not work in-game yet)

Extra credit goes to @scooterpsu, [whose code](https://github.com/scooterpsu/scooterpsu.github.io) I've based this project from.
