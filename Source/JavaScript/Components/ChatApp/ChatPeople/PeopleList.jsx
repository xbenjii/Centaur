import React, { Component } from 'react';
import Avatar from "@material-ui/core/Avatar/Avatar";
import {Subscriber} from "../../../Functional/Subscriber";
import {SubscriptionsEnum} from "../../../Configuration/SubscriptionsEnum";
import MoreVertIcon from '@material-ui/icons/MoreVertOutlined';
import JoinCard from "./JoinCard";
import {UserPair} from "../../../Functional/UserPair";

export default class PeopleList extends Component {
  static subs = [
    SubscriptionsEnum.user_change,
    SubscriptionsEnum.user_leave,
    SubscriptionsEnum.user_join
  ];

  state = {
    activeChatContext: {
      username: null,
      code: null
    },
    people: []
  };

  addPerson(person, code) {
    this.setState(prevState => ({
      people: [
        ...prevState.people,
        {
          ...person,
          code
        }
      ]
    }));
    this.changeChatContext({
      ...person,
      code
    });
  }

  componentDidMount() {
    this.subscriber = new Subscriber(
      this.props.websocket
    );

    this.subscriber.subscribe(
      PeopleList.subs,
      (data) => this.handleSubscriptionData(data)
    );

    this.props.setAddNewPerson((person, code) => this.addPerson(person, code));
    this.props.setOpenConversation((person) => this.changeChatContext(person))
  }

  componentWillUnmount() {
    this.subscriber.unsubscribe(
      PeopleList.subs
    );
  }

  changeChatContext(person) {
    this.props.onChange(person);
    this.setState({
      activeChatContext: {
        username: person['username'],
        code: person['code']
      }
    });
  }

  requestPair(code) {
    const userPair = new UserPair(this.props.websocket);
    userPair.request(
      code,
      this.props.activeUsername,
      this.props.joinCode,
      (user) => this.addPerson(
        user,
        code
      )
    );
  }

  handleSubscriptionData(data) {
    console.log(data);
  }

  render() {
    return (
      <section className="people-list">
        {this.state.people.length !== 0
          ? (this.state.people.map((person, index) => (
            <div tabIndex={1} className={`person ${this.state.activeChatContext.username === person['username'] && 'active'}`} key={index} role="button" onClick={() => this.changeChatContext(person)}>
              <MoreVertIcon className="action-trigger" />
              <Avatar className="person-avatar">
                {person.username[0].toUpperCase()}
              </Avatar>
              <section className="details">
                <div className="username">{person.username}</div>
                <div className="about">{person.details.userAbout.trim().length === 0 ? 'This user likes to keep a mystery surrounding them' : person.details.userAbout}</div>
              </section>
            </div>
          )))
          : <div className="no-people">No people are sharing a chat session with you at this moment.</div>}
          <JoinCard joinCode={this.props.joinCode} requestPair={(code) => this.requestPair(code)} />
      </section>
    );
  }
}