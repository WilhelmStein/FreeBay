import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import {Fade, Typography, Box, Grid, Button, Select, MenuItem, Card, CardMedia, CardContent} from '@material-ui/core';
import Pagination from 'material-ui-flat-pagination';


import Rating from '@material-ui/lab/Rating';

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
            view: "Detailed",
            offset: 0,
            resultsPerPage: 6
        }

        autoBind(this);
    }

    componentDidMount()
    {
        this.initFromURL(this.props);
    }

    componentWillReceiveProps(nextProps)
    {
        this.initFromURL(nextProps);
    }

    initFromURL(props)
    {
        const regex =  /{(.*?)}/g;

        var params = props.location.search.match(regex);

        var category = params[0].replace(/{|}/g, '');
        var text = params[1].replace(/{|}/g, '');

        this.setState({
            category: category,
            text: text,
            offset: 0
        })

        axios.post("/api/search", {
            category: category,
            text: text
        })
        .then(res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.setState({
                items: res.data.data
            })
        })
        .catch(err => console.log(err));
    }

    changeView(event)
    {
        this.setState({
            view: event.target.value,
            resultsPerPage: event.target.value.includes("Detailed") ? 6 : 18
        })
    }

    pressItem(item)
    {
        this.props.history.push(`/auction?id={${item.Id}}`);
    }

    userClick(user)
    {
        this.props.history.push(`/user/${user.Username}`);
    }

    auctionClick(event, id)
    {
        this.props.history.push(`/auction/${id}`);
    }

    paginate(offset, page)
    {
        this.setState({
            offset: offset
        })
    }

    render()
    {
        let items;

        const type = (item) => {
            if (this.state.view === "Detailed")
            {
                return <DetailedAuctionItem  item={item} userClick={this.userClick} auctionClick={this.auctionClick}/>;
            }
            else if (this.state.view === "Collapsed")
            {
                return <CollapsedAuctionItem item={item} userClick={this.userClick} auctionClick={this.auctionClick}/>;
            }
        }

        items = this.state.items
        .slice(this.state.offset, this.state.offset + this.state.resultsPerPage)
        .map( (item) => {
            return (
                <Grid item key={item.Id} >
                    {type(item)}
                </Grid>
            );
        })
    
        
        return (
            <div className="SearchResultsPage">
                <h2>
                    {this.state.items.length} results for:

                    <span className="ResultsName">
                        {this.state.text === "" ? "-" : this.state.text}
                    </span>

                    <span className="View">
                        View: &nbsp;
                        <Select className="Select" value={this.state.view} onChange={this.changeView}>
                            <MenuItem value="Detailed">Detailed</MenuItem>
                            <MenuItem value="Collapsed">Collapsed</MenuItem>
                        </Select>
                    </span>
                </h2>

                <hr/>

                <Pagination
                    className="Pagination"
                    size='large'
                    limit={this.state.resultsPerPage}
                    offset={this.state.offset}
                    total={this.state.items.length}
                    onClick={(e, offset, page) => this.paginate(offset, page)}
                />

                <Grid container spacing={3} className={`SearchResults ${this.state.view}`}>
                    {items}
                </Grid>

                <Pagination
                    className="Pagination"
                    size='large'
                    limit={this.state.resultsPerPage}
                    offset={this.state.offset}
                    total={this.state.items.length}
                    onClick={(e, offset, page) => this.paginate(offset, page)}
                />
            </div>
        );
    }
}


function DetailedAuctionItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Fade in={true}>
            <Card className={`Item ${props.grid ? "Grid" : ""}`}>
                <CardMedia
                    className="CardMedia"
                    image={props.item.Images && props.item.Images.length ? `/api/image?path=${props.item.Images[0].Path}` : "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                    title="Generic placeholder"
                />
                <CardContent className="ItemBody">

                    <Typography variant="h2" className="Title" onClick={(e) => {props.auctionClick(e, props.item.Id)}}>
                        {props.item.Name}
                    </Typography>

                    <Box mb={2} className="SellerBox">
                        <Typography display="inline"> Sold By:</Typography>

                        <Typography onClick={() => {props.userClick(props.item.User)}} className="Seller" display="inline" variant="h5">
                            &nbsp; &nbsp;{props.item.User.Username}
                        </Typography>
                            
                        <Rating className="Rating" display="inline" value={rating} precision={0.5} readOnly />
                    </Box>
                    
                    <Box className="Description">
                        {props.item.Description ? props.item.Description : "No Description."}
                    </Box>
                    
                </CardContent>

                <CardContent className="Pricing">
                    <Grid container className="Prices" spacing={1}>
                        <Grid item >
                            <Typography variant="h5" className="Title">Starting Price:</Typography>
                        </Grid>
                        <Grid item >
                            <Typography className="Starting Price" variant="h4">{props.item.First_Bid ? `EUR ${parseFloat(props.item.First_Bid).toFixed(2)}` : "-"}</Typography>
                        </Grid>

                        <Grid item >
                            <Typography variant="h5" className="Title">Current Price:</Typography>
                        </Grid>
                        <Grid item  zeroMinWidth>
                            <Typography className="Current Price" variant="h4">{props.item.Currently ? `EUR ${parseFloat(props.item.Currently).toFixed(2)}` : "-"}</Typography>
                        </Grid>

                        <Grid item >
                            <Typography variant="h5" className="Title">Buyout Price:</Typography>
                        </Grid>
                        <Grid item >
                            <Typography className="Buyout Price" variant="h4">{props.item.Buy_Price ? `EUR ${parseFloat(props.item.Buy_Price).toFixed(2)}` : "-"}</Typography>
                        </Grid>
                    </Grid>

                    <Box className="Dates" mt={2}>
                        <Typography>
                            Started in: <span className="Started Date">{props.item.Started}</span>
                        </Typography>
                        <Typography>
                            Ends in: <span className="Ends Date">{props.item.Ends}</span>
                        </Typography>
                    </Box>

                    <Box className="Buttons" mt={3}>
                        <Button className="Buy Button" variant="contained" onClick={(e) => {props.auctionClick(e, props.item.Id)}}>
                            Buy
                        </Button>
                    </Box>
                    
                </CardContent>
            </Card>
        </Fade>
        
    )
}

function CollapsedAuctionItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Fade in={true}>
            <Card className="Item">
                <CardMedia
                    className="CardMedia"
                    image={props.item.Images && props.item.Images.length ? `/api/image?path=${props.item.Images[0].Path}` : "https://dummyimage.com/100x100/ffffff/4a4a4a.png&text=No+Image"}
                    title="Generic placeholder"
                />
                <CardContent className="ItemBody">
                    <Typography variant="h2" noWrap className="Title"  onClick={(e) => {props.auctionClick(e, props.item.Id)}}>
                        {props.item.Name}
                    </Typography>

                    <Box className="SellerBox">
                        <Typography display="inline"> Sold By:</Typography>

                        <Typography onClick={() => {props.userClick(props.item.User)}} className="Seller" display="inline" variant="h5">
                            &nbsp; &nbsp;{props.item.User.Username}
                        </Typography>
                            
                        <Rating className="Rating" display="inline" value={rating} precision={0.5} readOnly />
                    </Box>
                </CardContent>
                <CardContent className="Pricing">
                    <Grid container className="Prices" spacing={1}>
                        <Grid item >
                            <Typography variant="h5" className="Title">Current Price:</Typography>
                        </Grid>
                        <Grid item  zeroMinWidth>
                        <Typography className="Current Price" variant="h4">{props.item.Currently ? `EUR ${parseFloat(props.item.Currently).toFixed(2)}` : "-"}</Typography>
                        </Grid>

                        <Grid item >
                            <Typography variant="h5" className="Title">Buyout Price:</Typography>
                        </Grid>
                        <Grid item >
                            <Typography className="Buyout Price" variant="h4">{props.item.Buy_Price ? `EUR ${parseFloat(props.item.Buy_Price).toFixed(2)}` : "-"}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>

                <CardContent className="Buttons">
                    <Button className="Buy Button" variant="contained" onClick={(e) => {props.auctionClick(e, props.item.Id)}}>
                        Buy
                    </Button>
                </CardContent>
            </Card>
        </Fade>
    )
}

export default withRouter(SearchResults);