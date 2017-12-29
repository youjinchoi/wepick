import React, { Component } from 'react';
import update from "react-addons-update";
import $ from "jquery";
import Timestamp from "./common/Timestamp"
import {withRouter} from "react-router-dom";

class QuestionList extends Component {
    AJAX_LOCKED = false;

    constructor(props) {
        super(props);
        this.state = {
            questions: null,
            next: null,
            hasNext: true
        };
    }

    render() {
        if (!window.__admin_loggedIn) {
            return null;
        }

        if (!this.state.questions || this.state.questions.length == 0) {
            return (
                <div className="wrapper home">
                    no question yet T.T
                </div>
            );
        }

        return (
            <div className="wrapper home">
                <ul className="post-list">
                    {this.state.questions.map((question, index) => {
                        return (
                            <div key={index}>
                                <h2>{question.contents}{question.isClosed ? "(종료)" : ""}</h2>
                                <p className="post-meta"><Timestamp timestamp={question.createDate}/></p>
                                <button onClick={() => {this.deleteQuestion(question.seq, index)}}>삭제</button>
                                <ul>
                                {question.options.map((option, index) => {
                                    return (<li key={index}>{option.value} ({option.count})</li>);
                                })}
                                </ul>
                                <br/>
                                <hr/>
                            </div>
                        );
                    })}
                </ul>
            </div>
        );
    }

    componentDidMount() {
        if (!window.__admin_loggedIn) {
            this.props.history.push("/login");
            return;
        }
        this.getDocuments();
        $(window).on("scroll", $.proxy(this.loadMoreIfScrollEnd, this));
    }

    componentWillUnmount() {
        $(window).off("scroll", $.proxy(this.loadMoreIfScrollEnd, this));
    }

    getDocuments = () => {
        if (!!this.AJAX_LOCKED) {
            return;
        }
        this.AJAX_LOCKED = true;
        var url = "/questions";
        if (!!this.state.next) {
            url += "?next=" + this.state.next;
        }
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            beforeSend : function(xhr){
                xhr.setRequestHeader("Server-Key", window.__admin_passCode);
            }.bind(this),
            success: function(res) {
                if (!res.result.list || res.result.list.length == 0) {
                    this.setState({
                        next: null,
                        hasNext: false
                    });
                }
                this.setState({
                    questions: update(this.state.questions || [], {
                        $push: res.result.list
                    }),
                    next: res.result.next
                });
                this.AJAX_LOCKED = false;
            }.bind(this),
            error: function(res, err) {
                this.AJAX_LOCKED = false;
            }.bind(this),
            timeout: 2000
        });
    }

    loadMoreIfScrollEnd = () => {
        var scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        if (scrollTop + window.innerHeight - document.body.scrollHeight > -20){
            this.loadMore();
        }
    }

    loadMore() {
        if (!!this.state.hasNext) {
            this.getDocuments(this.state.next);
        }
    }

    deleteQuestion = (seq, index) => {
        if (confirm("질문을 삭제하시겠습니까?")) {
            $.ajax({
                url: "/admin/questions/" + seq,
                type: "delete",
                dataType: "json",
                beforeSend : function(xhr){
                    xhr.setRequestHeader("Server-Key", window.__admin_passCode);
                },
                success: function(res) {
                    if (res && res.status == "OK") {
                        this.setState({
                            questions: update(this.state.questions, {
                                $splice: [[index, 1]]
                            })
                        });
                    }
                }.bind(this),
                error: function(res, err) {
                    alert('요청중 오류가 발생하였습니다.');
                }.bind(this),
                timeout: 2000
            });
        }
    }
}

export default withRouter(QuestionList);