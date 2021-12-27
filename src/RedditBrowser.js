// @flow

import "./RedditBrowser.css";
import React from "react";
import ContentEditable from "react-contenteditable";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const POSTS_PER_PAGE = 3;

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
        const url = this.state.posts[this.state.currentPostIndex].full_link;
        fetch(url + ".json?sort=top")
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                data = JSON.stringify(data);
                data = data.replaceAll("fuck", "<span style='color: red'>fuck</span>");
                data = data.replaceAll("shit", "<span style='color: red'>shit</span>");
                data = data.replaceAll("ass", "<span style='color: red'>ass</span>");
                data = data.replaceAll("cunt", "<span style='color: red'>cunt</span>");
                data = data.replaceAll("sex", "<span style='color: red'>sex</span>");
                data = data.replaceAll("cigarette", "<span style='color: red'>cigarette</span>");
                data = data.replaceAll("penis", "<span style='color: red'>penis</span>");
                data = data.replaceAll("pissed", "<span style='color: red'>pissed</span>");
                data = data.replaceAll("vagina", "<span style='color: red'>vagina</span>");
                data = data.replaceAll("naked", "<span style='color: red'>naked</span>");
                data = data.replaceAll("fetish", "<span style='color: red'>fetish</span>");
                data = data.replaceAll("bitch", "<span style='color: red'>bitch</span>");
                data = data.replaceAll("blowjob", "<span style='color: red'>blowjob</span>");
                data = data.replaceAll("boob", "<span style='color: red'>boob</span>");
                data = data.replaceAll("cameltoe", "<span style='color: red'>cameltoe</span>");
                data = data.replaceAll("chink", "<span style='color: red'>chink</span>");
                data = data.replaceAll("cock", "<span style='color: red'>cock</span>");
                data = data.replaceAll("dick", "<span style='color: red'>dick</span>");
                data = data.replaceAll("cum", "<span style='color: red'>cum</span>");
                data = data.replaceAll("nigg", "<span style='color: red'>nigg</span>");
                data = data.replaceAll("deepthroat", "<span style='color: red'>deepthroat</span>");
                data = data.replaceAll("whore", "<span style='color: red'>whore</span>");
                data = data.replaceAll("tit", "<span style='color: red'>tit</span>");
                data = data.replaceAll("testicle", "<span style='color: red'>testicle</span>");
                data = data.replaceAll("terrorist", "<span style='color: red'>terrorist</span>");
                data = data.replaceAll("suicide", "<span style='color: red'>suicide</span>");
                data = data.replaceAll("strapon", "<span style='color: red'>strapon</span>");
                data = data.replaceAll("slut", "<span style='color: red'>slut</span>");
                data = data.replaceAll("rimjob", "<span style='color: red'>rimjob</span>");
                data = data.replaceAll("pussy", "<span style='color: red'>pussy</span>");
                data = data.replaceAll("piss", "<span style='color: red'>piss</span>");
                data = data.replaceAll("poop", "<span style='color: red'>poop</span>");
                data = data.replaceAll("orgasim", "<span style='color: red'>orgasim</span>");
                data = JSON.parse(data);

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
        if (this.state.currentPost) {
            return this.state.currentPost[0].data.children[0].data.permalink;
        }

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

    getUps() {
        if (this.state.posts.length > this.state.currentPostIndex) {
            return this.state.posts[this.state.currentPostIndex].score;
        }

        return 0;
    }

    getPostBody() {
        return this.state.currentPost ? "[0].data.children[0].data" : {selftext: "Unloaded Body"};
    }

    changeSelectedDate(newDate) {
        this.setState({startDate: newDate}, () => this.callPostshift());
    }

    editableURL() {
        return (
            this.state.currentPostIndex < this.state.posts.length && (
                <input
                    editable
                    style={{width: "80%"}}
                    value={this.state.posts[this.state.currentPostIndex].full_link}
                    onChange={(event) => {
                        let posts = this.state.posts;
                        posts[this.state.currentPostIndex].full_link = event.target.value;
                        this.setState({posts});
                    }}
                />
            )
        );
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
                {this.editableURL()}
                {this.getPostTitle()}
                {this.getUps()}
                {this.state.currentPost && this.editableText("[0].data.children[0].data", "selftext")}
                {replies}
            </div>
        );
    }
}

export default RedditBrowser;
