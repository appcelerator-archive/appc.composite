# Composite Connector

This is a composite connector for Arrow. It lets you composite together models from other connectors in to a single model. Models are queried in parallel and the results are returned once the set of calls is completed.

## Installation

```bash
$ appc install connector/appc.composite --save
```

## Usage

### Example Models

```javascript
var User = Arrow.Model.extend('user', {
		fields: {
			first_name: { type: String },
			last_name: { type: String }
		},
		connector: 'appc.mysql'
	}),
	Post = Arrow.Model.extend('post', {
		fields: {
			title: { type: String },
			content: { type: String },
			author_id: { type: Number },
			attachment_id: { type: String }
		},
		connector: 'appc.mongo'
	}),
	Attachment = Arrow.Model.extend('attachment', {
		fields: {
			attachment_content: { name: 'content', type: String }
		},
		connector: 'appc.mongo'
	});
```

### Joining

The composite connector can join multiple models together in to a single model. It does this through the use of various joins.

#### Single Left Join
Let's say we have a table "post" with a field "author_id". author_id contains a string that maps to an "id" in a "user" table. Therefore, we can do a left join to look up the author, and mix its fields in to the model, as follows:

```javascript
Arrow.Model.extend('article', {
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

```sql
SELECT * FROM post p LEFT JOIN user u ON u.id = p.author_id;
```

The composite connector will thus do a findAll, query, update, or whatever other method you specify on "post" first.
Having received the results from post, it will then continue and do a query on "user", searching for the specific
"author_id" from each result, one at a time. It then merges the results together and returns them as one unified model.

#### Single Inner Join

The only practical difference between a left join and an inner join is for you to specify "inner_join" instead of
"left_join" in your composite model's metadata. With this property set, only results that successfully join on their
children will be returned. (In other words, the intersection of both sets.)

#### Multiple Joins

To join on multiple models, just change your left_join or inner_join to be an array of joins. Let's update our previous
example to also lookup an "attachment" table for our article:

```javascript
Arrow.Model.extend('article', {
	fields: {
		title: { type: String, model: 'post' },
		content: { type: String, model: 'post' },
		author_id: { type: Number, model: 'post' },
		author_first_name: { type: String, name: 'first_name', required: false, model: 'user' },
		author_last_name: { type: String, name: 'last_name', required: false, model: 'user' },
		attachment_id: { type: String, model: 'post' },
		attachment_content: { type: String, name: 'attachment_content', required: false, model: 'attachment' }
	},
	connector: 'appc.composite',

	metadata: {
		'appc.composite': {
			left_join: [
				{
					model: 'user',
					join_properties: {
						'id': 'author_id'
					}
				},
				{
					model: 'attachment',
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

#### Selecting Whole Models Instead of Fields

Instead of specifying the precise fields you want, you can instead include the entire joined model in your model.

For example:

```javascript
Arrow.Model.extend('accountContract', {
	fields: {
		account: { type: Object, model: 'account' },
		contract: { type: Object, model: 'contract' }
	},
	connector: 'appc.composite',

	metadata: {
		'appc.composite': {
			left_join: {
				model: 'contract',
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

#### Joining with Multiple Children

We have heretofore assumed that an article will have just a single author. But what if we want to join with multiple
results? For example, let's say we have a "author" model, and we want to select all of their posts. Just add
a field with type: Array and model: "post" and the connector will handle the rest:

```javascript
Arrow.Model.extend('authorWithArticles', {
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
				join_properties: {
					'author_id': 'id'
				}
			}
		}
	}
})
```
##### Controlling the Children Number

By default the number of joined children is 10. However, this number can be controlled by providing a value between 1 and 1000. To achieve this specify "limit" parameter on the field of type Array like this:

```javascript
Arrow.Model.extend('authorWithArticles', {
	fields: {
		name: { type: String, model: 'user' },
		posts: { type: Array, model: 'post', limit: '50' }
	},
	connector: 'appc.composite',
	metadata: {
		'appc.composite': {
			left_join: {
				model: 'post',
				join_properties: {
					'author_id': 'id'
				}
			}
		}
	}
})
```



# Unrelated Model Batching

What if your models aren't strongly related, but you want them returned together nonetheless? That's also supported:

```javascript
module.exports = function(Arrow) {
	return Arrow.Model.extend('user_post', {
		fields: {
			users: { type: Array, model: 'user' },
			posts: { type: Array, model: 'post' }
		},
		connector: 'appc.composite'
	});
}
```

Notice that we don't need any metadata. This just batches the two models together, so a findAll on the composite model
will result in the same being applied to each sub-model, and the results are returned together.

You can query by passing in the relevant arguments as sub-dictionaries:

```javascript
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

```javascript
{
	user: '9bcfd7d35d3f2ad0ad069665d0120',
	post: 61204
}
```

That findOne results in user.findOne('9bc...') being called, and post.findOne(61204).


## Development

> This section is for individuals developing the Composite Connector and not intended
  for end-users.

```bash
npm install
node app.js
```

### Running Unit Tests

To use the tests, you'll want to create a database in MySQL with the following tables:

```sql
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

```javascript
{ "title": "My Test Title", "content": "My articles content goes here.", "author_id": 1 }
```

Run the unit tests:

```bash
npm test
```

# Contributing

This project is open source and licensed under the [Apache Public License (version 2)](http://www.apache.org/licenses/LICENSE-2.0).  Please consider forking this project to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

To protect the interests of the contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA.  Once you've submitted it, you no longer need to send one for subsequent submissions.



# Legal Stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Arrow and associated marks are trademarks of Appcelerator. All other marks are intellectual property of their respective owners. Please see the LEGAL information about using our trademarks, privacy policy, terms of usage and other legal information at [http://www.appcelerator.com/legal](http://www.appcelerator.com/legal).
