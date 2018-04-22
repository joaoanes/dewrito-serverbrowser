## serverbrowser

This is an attempt of creating a halo 3 eldewrito compatible server browser that doesn't crash every time.

It does this mainly by using React, and making sure the server list is rerendered only when necessary, avoiding unnecessary DOM insertions. It uses redux in order to keep server information on a reliable place, and ensures a server isn't pinged twice by accident.

Extra credit goes to @scooterpsu, [whose code](https://github.com/scooterpsu/scooterpsu.github.io) I've based this project from.
