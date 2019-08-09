import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";
import { ListGroup, ListGroupItem, Media } from 'react-bootstrap';

import "../style/SearchResults.scss"


class SearchResults extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            items: [],
            category: -1,
            text: "",
            view: "Collapsed"
        }

        autoBind(this);
    }

    componentDidMount()
    {
        const regex =  /{(.*?)}/g;

        var params = this.props.location.search.match(regex);

        var category = params[0].replace(/{|}/g, '');
        var text = params[1].replace(/{|}/g, '');

        this.setState({
            category: category,
            text: text
        })

        axios.post("/api/search", {
            category: category,
            text: text
        })
        .then(res => {
            this.setState({
                items: res.data.data
            })
        })
        .catch(err => console.log(err));
    }

    changeView(event)
    {
        this.setState({
            view: event.target.value
        })
    }

    pressItem(item)
    {
        this.props.history.push(`/auction?id={${item.Id}}`);
    }

    render()
    {
        let items;

        if (this.state.view === "Detailed")
        {
            items = this.state.items.map( (item) => {
                return (
                    <ListGroupItem key={item.Id} className="ListItem" onClick={() => this.pressItem(item)}>
                        <DetailedAuctionItem  item={item}/>
                    </ListGroupItem>
                );
            })
        }
        else if (this.state.view === "Collapsed")
        {
            items = this.state.items.map( (item) => {
                return (
                    <ListGroupItem key={item.Id} className="ListItem" onClick={() => this.pressItem(item)}>
                        <CollapsedAuctionItem item={item}/>
                    </ListGroupItem>
                );
            })
        }
        

        return (
            <div className="SearchResultsPage">
                <h2>
                    {items.length} results for " {this.state.text} ":
                    <span>
                        View: &nbsp;
                        <select onChange={this.changeView}>
                            <option value="Detailed">Detailed</option>
                            <option value="Collapsed">Collapsed</option>
                        </select>
                    </span>
                </h2>
                
                <ListGroup variant="flush" className={this.state.view === "Detailed" ? "SearchResults Detailed" : "SearchResults Collapsed"}>
                    {items}
                </ListGroup>
            </div>
        );
    }
}

function DetailedAuctionItem(props)
{
    return (
        <Media className="Item">
            <img
                width={300}
                height={300}
                className="align-self-start mr-3"
                src="https://picsum.photos/300/300"
                alt="Generic placeholder"
            />
            <Media.Body className="ItemBody">
                <h3>{props.item.Name}</h3>
                <p className="Seller"> Sold By: &nbsp;&nbsp; <span>{props.item.User.Username}</span> </p>
                <h5>Description: </h5>
                <p className="Description">{props.item.Description}</p>
                <br/>
                <div className="Prices">
                    <div> 
                        <p>Starting Price:</p>
                        <p className="Starting Price">$ {props.item.First_bid}</p> 
                    </div>

                    <div> 
                        <p>Current Price:</p>
                        <p className="Current Price">$ {props.item.Currently}</p> 
                    </div>

                    <div> 
                        <p>Buyout Price:</p>
                        <p className="Buyout Price">$ {props.item.Buy_Price}</p> 
                    </div>
                </div>
            </Media.Body>
            <Media.Body className="ItemBody">
                
            </Media.Body>
        </Media>
    )
}

function CollapsedAuctionItem(props)
{
    return (
        <Media className="Item">
            <img
                width={100}
                height={100}
                className="align-self-start mr-3"
                src="https://picsum.photos/100/100"
                alt="Generic placeholder"
            />
            <Media.Body className="ItemBody">
                <h3>{props.item.Name}</h3>
                <p className="Seller"> Sold By: &nbsp;&nbsp; <span>{props.item.User.Username}</span> </p>
            </Media.Body>
            <Media.Body className="ItemBody">

                <div className="Prices">
                    <div> 
                        <p>Current Price:</p>
                        <p className="Current Price">$ {props.item.Currently}</p> 
                    </div>

                    <div> 
                        <p>Buyout Price:</p>
                        <p className="Buyout Price">$ {props.item.Buy_Price}</p> 
                    </div>
                </div>
            </Media.Body>
        </Media>
    )
}

export default withRouter(SearchResults);