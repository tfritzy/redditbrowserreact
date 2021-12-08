// @flow

import "./RedditBrowser.css";
import React from "react";
import ContentEditable from "react-contenteditable";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const POSTS_PER_PAGE = 5;

Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
    s = s.replace(/^\./, ""); // strip a leading dot
    var a = s.split(".");
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
};

class RedditBrowser extends React.Component {
    constructor() {
        super();
        this.state = {
            startDate: new Date(2017, 1, 1),
            posts: [],
            currentPostIndex: 0,
            currentPost: null,
            hiddenPosts: new Set(),
            selectedPosts: new Set(),
            postMap: {},
        };
        this.getPost = this.getPost.bind(this);
    }

    togglePostHidden(postId) {
        if (this.state.hiddenPosts.has(postId)) {
            this.state.hiddenPosts.delete(postId);
        } else {
            this.state.hiddenPosts.add(postId);
        }

        this.setState({hiddenPosts: this.state.hiddenPosts});
    }

    selectPost(postId) {
        if (this.state.selectedPosts.has(postId)) {
            this.state.selectedPosts.delete(postId);
        } else {
            this.state.selectedPosts.add(postId);
        }

        this.setState({selectedPosts: this.state.selectedPosts});
    }

    renderNode(node, path) {
        if (!node || !node["body"]) {
            return null;
        }

        const id = node["id"];
        if (this.state.hiddenPosts.has(id)) {
            return <button onClick={() => this.togglePostHidden(id)}>➕</button>;
        }

        if (!node["replies"] || !node["replies"]) {
            return null;
        }

        const childrenFragments = [];

        for (let i = 0; i < node["replies"]["data"]["children"].length; i++) {
            let child = node["replies"]["data"]["children"][i];
            let fragment = this.renderNode(child["data"], path + `.replies.data.children[${i}].data`);
            if (fragment) {
                childrenFragments.push(fragment);
            }
        }

        const nodeHtml = (
            <div>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <button onClick={() => this.togglePostHidden(id)}>➖</button>
                    <button onClick={() => this.selectPost(id)}>{this.state.selectedPosts.has(id) ? "✔" : "💾"}</button>
                    {this.editableText(path, "body")}
                </div>

                {childrenFragments.map((child) => (
                    <div style={{paddingLeft: "24px"}}>{child}</div>
                ))}
            </div>
        );

        return nodeHtml;
    }

    componentDidMount() {
        this.callPostshift();
    }

    callPostshift() {
        const startDateStr = this.state.startDate.toISOString().split("T")[0];
        let endDate = new Date(startDateStr);
        endDate.setDate(endDate.getDate() + 1);
        const endDateStr = endDate.toISOString().split("T")[0];
        const url = `https://apiv2.pushshift.io/reddit/submission/search/?subreddit=askreddit&limit=${POSTS_PER_PAGE}&sort=desc&sort_type=score&after=${startDateStr}&before=${endDateStr}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                this.setState({posts: data["data"]}, () => console.log(this.state.posts));
            });
    }

    getPost() {
        const url = this.state.posts[this.state.currentPostIndex]["full_link"];
        fetch(url + ".json?sort=top")
            .then((response) => response.json())
            .then((data) => {
                this.setState({currentPost: data}, () => console.log(data));
            });
    }

    filterUnselectedChildren(childrenArray) {
        const remainingChildren = [];
        for (let i = 0; i < childrenArray.length; i++) {
            const child = childrenArray[i];
            if (this.state.selectedPosts.has(child["data"]["id"])) {
                child.data.replies.data.children = this.filterUnselectedChildren(child.data.replies.data.children);
                remainingChildren.push(child);
            }
        }

        return remainingChildren;
    }

    export() {
        let postForExport = JSON.parse(JSON.stringify(this.state.currentPost));
        postForExport[1].data.children = this.filterUnselectedChildren(postForExport[1].data.children);

        // Create a blob with the data we want to download as a file
        const blob = new Blob([JSON.stringify(postForExport)], {type: "text/json"});
        // Create an anchor element and dispatch a click event on it
        // to trigger a download
        const a = document.createElement("a");
        let name = this.getPostPermaLink().split("/");
        name.pop();
        a.download = name.pop() + ".json";
        a.href = window.URL.createObjectURL(blob);
        const clickEvt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        a.dispatchEvent(clickEvt);
        a.remove();
    }

    changePostIndex(delta) {
        let postIndex = this.state.currentPostIndex;
        postIndex += delta;
        let shouldRefreshPostshift = false;
        if (postIndex < 0) {
            this.state.startDate.setDate(this.state.startDate.getDate() - 1);
            postIndex = POSTS_PER_PAGE - 1;
            shouldRefreshPostshift = true;
        }

        if (postIndex >= POSTS_PER_PAGE) {
            this.state.startDate.setDate(this.state.startDate.getDate() + 1);
            postIndex = 0;
            shouldRefreshPostshift = true;
        }

        this.setState({currentPost: null, currentPostIndex: postIndex, startDate: this.state.startDate}, () => {
            if (shouldRefreshPostshift) {
                this.callPostshift();
            }
        });
    }

    editableText(pathToNode, textKey) {
        if (!this.state.currentPost) {
            return null;
        }

        return (
            <ContentEditable
                html={`${Object.byString(this.state.currentPost, pathToNode)[textKey]}`} // innerHTML of the editable div
                disabled={false} // use true to disable editing
                onChange={(event) => {
                    console.log(event);

                    Object.byString(this.state.currentPost, pathToNode)[textKey] = event.target.value;
                    this.setState({currentPost: this.state.currentPost});
                }} // handle innerHTML change
                tagName="article" // Use a custom HTML tag (uses a div by default)
                style={{fontSize: "16px", margin: "6px"}}
            />
        );
    }

    getPostPermaLink() {
        return this.state.posts.length > this.state.currentPostIndex
            ? this.state.posts[this.state.currentPostIndex]["permalink"]
            : "loading post";
    }

    getPostTitle() {
        if (this.state.currentPost) {
            return this.editableText("[0].data.children[0].data", "title");
        } else if (this.state.posts.length > this.state.currentPostIndex) {
            return <p>{this.state.posts[this.state.currentPostIndex].title}</p>;
        } else {
            return null;
        }
    }

    getPostBody() {
        return this.state.currentPost ? "[0].data.children[0].data" : {selftext: "Unloaded Body"};
    }

    changeSelectedDate(newDate) {
        this.setState({startDate: newDate}, () => this.callPostshift());
    }

    render() {
        const replies = [];
        if (this.state.currentPost) {
            for (let i = 0; i < this.state.currentPost[1]["data"]["children"].length; i++) {
                const reply = this.state.currentPost[1]["data"]["children"][i]["data"];
                replies.push(this.renderNode(reply, `[1].data.children[${i}].data`));
            }
        }

        return (
            <div className="RedditBrowser">
                <div style={{display: "flex", flexDirection: "row", alignItems: "flex-start"}}>
                    <DatePicker selected={this.state.startDate} onChange={(date) => this.changeSelectedDate(date)} />
                    <button onClick={() => this.export()}>Export</button>
                    <button onClick={this.getPost}>Get Post</button>
                    <button onClick={() => this.changePostIndex(-1)}>Prev</button>
                    <button onClick={() => this.changePostIndex(1)}>Next</button>
                </div>

                <span>{this.getPostPermaLink()}</span>
                {this.getPostTitle()}
                {this.state.currentPost && this.editableText("[0].data.children[0].data", "selftext")}
                {replies}
            </div>
        );
    }
}

export default RedditBrowser;
