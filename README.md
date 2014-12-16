# Mobware Composite Connector

This is a composite APIBuilder connector.

> This software is pre-release and not yet ready for usage.  Please don't use this just yet while we're working through testing and finishing it up. Once it's ready, we'll make an announcement about it.

To install:

```bash
$ appc install appc.composite --save
```

To use the tests, you'll want to create a database in MySQL with the following table:

```
CREATE TABLE Composite_UserTable
(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(255),
	last_name VARCHAR(255)
);
INSERT INTO Composite_UserTable (first_name, last_name) VALUES ('Dawson', 'Toth');
```

Then you can create an article with a JSON body like this:

```
{ "title": "My Test Title", "content": "My articles content goes here.", "author_id": 1 }
```

# License

This source code is licensed as part of the Appcelerator Enterprise Platform and subject to the End User License Agreement and Enterprise License and Ordering Agreement. Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved. This source code is Proprietary and Confidential to Appcelerator, Inc.
