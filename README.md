# odin-messaging-app

This application is designed to allow users to customise a user profile and send/receive messages
with other users on their friends list.

## Features

### Dashboard

The Dashboard is the main part of the application, where the user can set their account preferences
and settings, view friends, friend requests, and chats. They can also log out from this page.

### Friends

The user can add friends via searching them by their username. Any user with pending friend requests
can view these in the 'Friends' --> 'Friend Requests' tab and choose to either accept or decline
them. Any accepted friend requests will result in that user being added to the user's friends list.
Users will have their profile image, tag line, display name and set status visible to all other
users on their friends list.

### Chats

The user can create chats by clicking the 'Create Chat' button in the 'Chats' panel. Chats allow the
user to send and receive text messages and image messages. Each message can also be 'in reply' to
an earlier message in the chat, with the content of the message being replied to displayed in the
message, if applicable.

There are two types of chat:

##### 'Individual'

An 'individual' chat has the following properties:

- The user and any of the user's friends will only ever have **one** individual chat between them.
- Other users can **not** be added to this type of chat; any attempt to do so will create a fresh,
empty chat with the users specified.
- Both users in the chat have the same privileges.

##### 'Group'

A 'group' chat has the following properties:

- An unlimited amount can exist for any given group of users (e.g. - if three users create a group
chat, those same three users can have another group chat. This is not possible with
'individual'-type chats).
- Other users can be added to the chat by clicking the 'Add Person' button. Any duplicate users will
not be added. If attempting to add *only* duplicate users, the user will be informed.
- Only users with the 'admin' or 'moderator' roles will be able to add new users. 'guest' users can
post messages in the chat. Any 'muted' users will not be able to post messages in the chat.

### User Profile

Users must first create an account with a unique username and email address, in addition to a RegEx
pattern-matched password. This password is hashed and stored in a database, along with other user
credentials.

Once the user has created their account, they are redirected to the Dashboard. If the user logs out
at any point, they can log back in via the log-in page, where they need to enter their username and
password (the one they used to create their account).

A user can set a number of account settings:

##### 'Account Information' Tab

- Display Name: If the user wants to have a custom name displayed to their friends, they can use
this setting (optional).
- Tag Line: A short line of custom text used to describe the user (optional).
- Status: A user will have a default status based on their activity, but if they wish to appear as a
current status (e.g. - appear 'offline' at all times), they can do so with this setting (optional).
- Profile Image: If the user does not upload a custom profile image using this setting, a default
one chosen at the time of account creation will be used instead.

##### 'Settings' Tab

- Theme: The user can choose a preset colour palette that will alter the styling of the client.

## Things I Would Change

### Components

Some of the components in the application are quite large, with a lot of features. They could
likely be separated in to numerous smaller components. An additional benefit of this approach would
be that smaller components are generally easier to test. 

### Images

Images seem to be the main bottleneck when requesting data from the database. The efficiency of
responding to the client with image data would likely benefit from having some kind of
**image compression**. They also make the client extremely slow when there are many images, for
example in the friends list/chats list, or when there are many messages displayed in a chat that
contain images (and also the users' profile images accompanying those messages).

Since the images are currently being stored in the database itself, I would like to have a better
storage solution for them.