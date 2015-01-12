# Composite Connector

This is a composite API Builder connector.

> This software is pre-release and not yet ready for usage.  Please don't use this just yet while we're working through testing and finishing it up. Once it's ready, we'll make an announcement about it.

To install:

```bash
$ appc install connector/appc.composite --save
```

# Joining

The composite connector can join multiple models together in to a single model. It does this through the use of various joins.

## Single Left Join
Let's say we have a table "post" with a field "author_id". author_id contains a string that maps to an "id" in a "user" table. Therefore, we can do a left join to look up the author, and mix its fields in to the model, as follows:

```
APIBuilder.Model.extend('article', {
	fields: {
		title: { type: String, model: 'post' },
		content: { type: String, model: 'post' },
		author_id: { type: Number, model: 'post' },
		author_first_name: { type: String, name: 'first_name', required: false, model: 'user' },
		author_last_name: { type: String, name: 'last_name', required: false, model: 'user' }
	},
	connector: 'appc.composite',

	metadata: {
		'appc.composite': {
			left_join: {
				model: 'user',
				readonly: true,
				join_properties: {
					'id': 'author_id'
				}
			}
		}
	}
})
```

The often difficult bit to understand is that "left_join" property, so let's unpack it together. Notice that we specify
a model of "user" or "post" on each of the fields, and in the join, only model "user". This implies that "post" is our
main table, and all results will be drawn first from it. An equivalent SQL statement might look like this:

```
SELECT * FROM post p LEFT JOIN user u ON u.id = p.author_id;
```

The composite connector will thus do a findAll, query, update, or whatever other method you specify on "post" first.
Having received the results from post, it will then continue and do a query on "user", searching for the specific
"author_id" from each result, one at a time. It then merges the results together and returns them as one unified model.

## Single Inner Join

The only practical difference between a left join and an inner join is for you to specify "inner_join" instead of
"left_join" in your composite model's metadata. With this property set, only results that successfully join on their
children will be returned. (In other words, the intersection of both sets.)

## Multiple Joins

To join on multiple models, just change your left_join or inner_join to be an array of joins. Let's update our previous
example to also lookup an "attachment" table for our article:

```
APIBuilder.Model.extend('article', {
	fields: {
		title: { type: String, model: 'post' },
		content: { type: String, model: 'post' },
		author_id: { type: Number, model: 'post' },
		author_first_name: { type: String, name: 'first_name', required: false, model: 'user' },
		author_last_name: { type: String, name: 'last_name', required: false, model: 'user' },
		attachment_id: { type: Number, model: 'post' },
		attachment_content: { type: String, name: 'attachment_content', required: false, model: 'attachment' }
	},
	connector: 'appc.composite',

	metadata: {
		'appc.composite': {
			left_join: [
				{
					model: 'user',
					readonly: true,
					join_properties: {
						'id': 'author_id'
					}
				},
				{
					model: 'attachment',
					readonly: true,
					join_properties: {
						'id': 'attachment_id'
					}
				}
			]
		}
	}
})
```

The connector will go through the left_joins in order, looking them up and merging the results together.

## Selecting Whole Models Instead of Fields

Instead of specifying the precise fields you want, you can instead include the entire joined model in your model.
 
For example:

```
APIBuilder.Model.extend('accountContract', {
	fields: {
		account: { type: Object, model: 'account' },
		contract: { type: Object, model: 'contract' }
	},
	connector: 'appc.composite',

	metadata: {
		'appc.composite': {
			left_join: {
				model: 'contract',
				readonly: true,
				join_properties: {
					'AccountId': 'id'
				}
			}
		}
	}
})
```

This will look up accounts and each instance will have the account stored in an "account" sub-dictionary. Then it will
look up contracts that have an AccountId of the account's id, and store one in a "contract" sub-dictionary.

## Joining with Multiple Children

We have heretofore assumed that an article will have just a single author. But what if we want to join with multiple
results? For example, let's say we have a "author" model, and we want to select all of their posts. Just add
"multiple: true" to the metadata and a field with type: Array and model: "post" and the connector will handle the rest:

```
APIBuilder.Model.extend('authorWithArticles', {
	fields: {
		first_name: { type: String, model: 'user' },
		last_name: { type: String, model: 'user' },
		posts: { type: Array, model: 'post' }
	},
	connector: 'appc.composite',

	metadata: {
		'appc.composite': {
			left_join: {
				model: 'post',
				readonly: true,
				multiple: true,
				join_properties: {
					'author_id': 'id'
				}
			}
		}
	}
});
```

# Unrelated Model Batching

What if your models aren't strongly related, but you want them returned together nonetheless? That's also supported:

```
module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('user_post', {
		fields: {
			users: { type: Array, collection: 'user' },
			posts: { type: Array, collection: 'post' }
		},
		connector: 'appc.composite'
	});
};
```

Notice that we don't need any metadata. This just batches the two models together, so a findAll on the composite model
will result in the same being applied to each sub-model, and the results are returned together.

You can query by passing in the relevant arguments as sub-dictionaries:

```
{
	user: {
		limit: 1
	},
	post: {
		where: { title: 'Title1' }
	}
}
```

This applies to all the methods. For example, a findOne could look like this:

```
{
	user: '9bcfd7d35d3f2ad0ad069665d0120',
	post: 61204
}
```

That findOne results in user.findOne('9bc...') being called, and post.findOne(61204).


# Testing

To use the tests, you'll want to create a database in MySQL with the following tables:

```
CREATE DATABASE IF NOT EXISTS connector;
USE connector;
CREATE TABLE IF NOT EXISTS Composite_UserTable
(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(255),
	last_name VARCHAR(255)
);
INSERT INTO Composite_UserTable (first_name, last_name) VALUES ('Dawson', 'Toth');
CREATE TABLE IF NOT EXISTS nolan_user (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(40),
	last_name VARCHAR(50),
	email_address VARCHAR(100),
	phone_number VARCHAR(20),
	home_address VARCHAR(30)
);
CREATE TABLE IF NOT EXISTS nolan_user_bad_habits(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	habit VARCHAR(100) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES nolan_user (id) on delete cascade
);
```

Then you can create an article with a JSON body like this:

```
{ "title": "My Test Title", "content": "My articles content goes here.", "author_id": 1 }
```

# License

This source code is licensed as part of the Appcelerator Enterprise Platform and subject to the End User License Agreement and Enterprise License and Ordering Agreement. Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved. This source code is Proprietary and Confidential to Appcelerator, Inc.
