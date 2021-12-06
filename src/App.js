// @flow

import logo from "./logo.svg";
import "./App.css";
import React from "react";
import ContentEditable from "react-contenteditable";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

class RedditBrowser extends React.Component {
    constructor() {
        super();
        this.contentEditable = React.createRef();
        this.state = {
            startDate: new Date(),
            posts: [],
            currentPostIndex: 0,
            currentPost: null,
        };
        this.getPost = this.getPost.bind(this);
    }

    componentDidMount() {
        this.callPostshift();
    }

    callPostshift() {
        console.log("Calling postshift");
        const startDateStr = this.state.startDate.toISOString().split("T")[0];
        let endDate = new Date(startDateStr);
        endDate.setDate(endDate.getDate() + 1);
        const endDateStr = endDate.toISOString().split("T")[0];
        const url =
            "https://apiv2.pushshift.io/reddit/submission/search/" +
            "?subreddit=tifu" +
            "&limit=5" +
            "&sort=desc" +
            "&sort_type=score" +
            `&after=${startDateStr}` +
            `&before=${endDateStr}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                this.setState({posts: data["data"]}, () => console.log(this.state.posts));
            });
    }

    getPost() {
        const url = this.state.posts[this.state.currentPostIndex]["full_link"];
        fetch(url + ".json")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                this.setState({currentPost: data});
            });
    }

    editableText(text) {
        return (
            <ContentEditable
                innerRef={this.contentEditable}
                html={`<span>${text}</span>`} // innerHTML of the editable div
                disabled={false} // use true to disable editing
                onChange={this.handleChange} // handle innerHTML change
                tagName="article" // Use a custom HTML tag (uses a div by default)
            />
        );
    }

    getPostPermaLink() {
        return this.state.posts.length > this.state.currentPostIndex
            ? this.state.posts[this.state.currentPostIndex]["permalink"]
            : "loading post";
    }

    getPostTitle() {
        return this.state.currentPost
            ? this.state.currentPost[0]["data"]["children"][0]["data"]["title"]
            : "Unloaded Title";
    }

    render() {
        console.log(this.state.posts.length);
        return (
            <div className="App">
                <header className="App-header">
                    <DatePicker selected={this.state.startDate} onChange={(date) => this.setState({startDate: date})} />
                    <button onClick={this.getPost}>Get Post</button>
                    <span>{this.getPostPermaLink()}</span>
                    {this.editableText(this.getPostTitle())}
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                        Learn React
                    </a>
                </header>
            </div>
        );
    }
}

export default RedditBrowser;
