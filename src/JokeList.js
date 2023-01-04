import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
    static defaultProps = {
        numJokesToGet: 10
    };

    constructor(props) {
        super(props);
        this.state = { jokes: [] }
        this.generateNewJokes = this.generateNewJokes.bind(this);
    };

    /* at mount, get jokes */
    componentDidMount() {
        if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
    };

    componentDidUpdate() {
        if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
    };

    /* get Jokes from API */

    async getJokes() {
        try {
            let jokes = this.state.jokes;
            let jokeVotes = JSON.parse(
                window.localStorage.getItem("jokeVotes") || "{}"
            )

            let seenJokes = new Set(jokes.map(j => j.id));
            
            
                while (jokes.length < this.props.numJokesToGet) {
                    let res = await axios.get("https://icanhazdadjoke.com", {
                        headers: { Accept: "application/json" }
                    });
                    let { status, ...jokeObj } = res.data;

                    if (!seenJokes.has(jokeObj.id)) {
                        seenJokes.add(jokeObj.id);
                        jokes.push({ ...jokeObj, votes: 0 });
                    } else {
                        console.error("duplicate found!");
                    }
                }
                this.setState({ jokes });
            window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
        }
        catch (e) {
            console.log(e);
        }
    }

    /* empty joke list and then call getJokes */
    generateNewJokes() {
        this.setState(st => ({jokes: st.jokes}))
    }

    // resetVotes() {
    //     window.localStorage.setItem("jokeVotes", {});
    //     this.setState(st => ({
    //         jokes: st.jokes.map(joke => ({ ...joke, votes: 0 }))
    //     }))
    // };

    /* change vote for this id by delta (+1 or -1) */
    vote(id, delta) {
        let jokeVotes = JSON.parse(window.localStorage.getItem("jokeVotes"));
        jokeVotes[id] = (jokeVotes[id] || 0) + delta;
        window.localStorage.setitem("jokeVotes", JSON.stringify(jokeVotes));
        this.setState(st => ({
            jokes: st.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
        }));
    }

    /* render list of sorted jokes */
    render() {
        let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

        return (
            <div className="JokeList">
                <button className="JokeList-getmore" onClick={this.generateNewJokes}>
                    Get New Jokes
                </button>

                {sortedJokes.map(j => (
                    <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
                ))}
            </div>
        );
    }

}

// function JokeList({ numJokesToGet = 10 }) {
//   const [jokes, setJokes] = useState([]);

//   /* get jokes if there are no jokes */

//   useEffect(function() {
//     async function getJokes() {
//       let j = [...jokes];
//       let seenJokes = new Set();
//       try {
//         while (j.length < numJokesToGet) {
//           let res = await axios.get("https://icanhazdadjoke.com", {
//             headers: { Accept: "application/json" }
//           });
//           let { status, ...jokeObj } = res.data;
  
//           if (!seenJokes.has(jokeObj.id)) {
//             seenJokes.add(jokeObj.id);
//             j.push({ ...jokeObj, votes: 0 });
//           } else {
//             console.error("duplicate found!");
//           }
//         }
//         setJokes(j);
//       } catch (e) {
//         console.log(e);
//       }
//     }

//     if (jokes.length === 0) getJokes();
//   }, [jokes, numJokesToGet]);

//   /* empty joke list and then call getJokes */

//   function generateNewJokes() {
//     setJokes([]);
//   }

//   /* change vote for this id by delta (+1 or -1) */

//   function vote(id, delta) {
//     setJokes(allJokes =>
//       allJokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
//     );
//   }

//   /* render: either loading spinner or list of sorted jokes. */

//   if (jokes.length) {
//     let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  
//     return (
//       <div className="JokeList">
//         <button className="JokeList-getmore" onClick={generateNewJokes}>
//           Get New Jokes
//         </button>
  
//         {sortedJokes.map(j => (
//           <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={vote} />
//         ))}
//       </div>
//     );
//   }

//   return null;

// }

export default JokeList;
