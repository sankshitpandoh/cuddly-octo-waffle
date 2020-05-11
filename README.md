# NoteIt
A task keeper / scheduler web app for personal use.
This app stores your data in json format inside the project directory inside data folder.

# How to use
- Clone this repository
```
git clone https://github.com/sankshitpandoh/cuddly-octo-waffle
```
- Install all dependenices
```
npm install
```
- Start the app
```
npm start 
```
if the above command throws some error go with:
```
node start
```

# Important Information
This app runs a cronjob in background which shifts all you finsihed tasks from main **data.json** to **completedTask.json** to increase the flow of data exchange and give a smoother experience when dealing with a lot of tasks.

Also to **protect your saved tasks**, it is highly recommended to **take a backup of your data folder everytime before you pull from this repository for any changes** or all your data will be lost.

# Supporting Me
Thanks for using this project!
Please star this project, share it on Social Media.
If you want to hire me for contract / freelance work, you can do so! [Get in touch with me](https://www.linkedin.com/in/sankshit-pandoh/)
