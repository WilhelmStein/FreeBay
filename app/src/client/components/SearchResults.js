import React, { Component } from 'react';
import autoBind from 'auto-bind';
import { withRouter } from 'react-router-dom';
import axios from "axios";

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';

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
            view: "Square Grid"
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

        let gridDivision = 12;
        if (this.state.view.includes("Grid"))
        {
            gridDivision = this.state.view === "Square Grid" ? 4 : 6
        }

        const type = (item) => {
            if (this.state.view === "Detailed")
            {
                return <DetailedAuctionItem  item={item}/>;
            }
            else if (this.state.view === "Collapsed")
            {
                return <CollapsedAuctionItem item={item}/>;
            }
            else if (this.state.view === "Square Grid")
            {
                return <SquareAuctionItem grid item={item}/>
            }
            else if (this.state.view === "Detailed Grid")
            {
                return <DetailedAuctionItem grid item={item}/>;
            }
            else if (this.state.view === "Collapsed Grid")
            {
                return <CollapsedAuctionItem grid item={item}/>;
            }
        }

        items = this.state.items.map( (item) => {
            return (
                <Grid item xs={gridDivision} key={item.Id} >
                    {type(item)}
                </Grid>
            );
        })
    
        
        return (
            <div className="SearchResultsPage">
                <h2>
                    {items.length} results for " {this.state.text} ":
                    <span>
                        View: &nbsp;
                        <Select className="Select" value={this.state.view} onChange={this.changeView}>
                            <MenuItem value="Detailed">Detailed</MenuItem>
                            <MenuItem value="Collapsed">Collapsed</MenuItem>
                            <MenuItem value="Detailed Grid">Detailed Grid</MenuItem>
                            <MenuItem value="Collapsed Grid">Collapsed Grid</MenuItem>
                            <MenuItem value="Square Grid">Square Grid</MenuItem>
                        </Select>
                    </span>
                </h2>

                <hr/>

                <Grid container spacing={3} className={`SearchResults ${this.state.view}`}>
                    {items}
                </Grid>
            </div>
        );
    }
}


function DetailedAuctionItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Card className={`Item ${props.grid ? "Grid" : ""}`}>
            <CardMedia
                image={`https://picsum.photos/${props.grid ? 250 : 250}/${props.grid ? 250 : 250}`}
                title="Generic placeholder"
            />
            <CardContent className="ItemBody">

                <Typography variant="h2">
                    {props.item.Name}
                </Typography>

                <Box mb={2}>
                    <Typography display="inline"> Sold By:</Typography>

                    <Typography className="Seller" display="inline" variant="h5">
                        &nbsp; &nbsp;{props.item.User.Username}
                    </Typography>
                        
                    <Rating display="inline" value={rating} precision={0.5} readOnly />
                </Box>
                
                <Typography paragraph className="Description">
                    {props.item.Description === null ? "No Description." : props.item.Description}
                </Typography>
                
            </CardContent>

            <CardContent className="Pricing">
                <Grid container className="Prices" spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Starting Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Starting Price" variant="h4">EUR {props.item.First_bid}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Current Price:</Typography>
                    </Grid>
                    <Grid item xs={6} zeroMinWidth>
                        <Typography className="Current Price" variant="h4">EUR {props.item.Currently}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Buyout Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Buyout Price" variant="h4">EUR {props.item.Buy_Price}</Typography>
                    </Grid>
                </Grid>

                <Box className="Buttons" mt={3}>
                    <Button className="Bid Button" variant="contained">
                        Bid
                    </Button>
                    <Button className="Buyout Button" variant="contained">
                        Buyout
                    </Button>
                </Box>

                <Box className="Dates" mt={2}>
                    <Typography>
                        Started in: <span className="Started Date">{props.item.Started}</span>
                    </Typography>
                    <Typography>
                        Ends in: <span className="Ends Date">{props.item.Ends}</span>
                    </Typography>
                </Box>
                
            </CardContent>
        </Card>
    )
}

function CollapsedAuctionItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Card className="Item">
            <CardMedia
                image="https://picsum.photos/100/100"
                title="Generic placeholder"
            />
            <CardContent className="ItemBody">
                <Typography variant="h2">
                    {props.item.Name}
                </Typography>

                <Box mb={3}>
                    <Typography display="inline"> Sold By:</Typography>

                    <Typography className="Seller" display="inline" variant="h5">
                        &nbsp; &nbsp;{props.item.User.Username}
                    </Typography>
                        
                    <Rating display="inline" value={rating} precision={0.5} readOnly />
                </Box>
            </CardContent>
            <CardContent className="Pricing">
                <Grid container className="Prices" spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Current Price:</Typography>
                    </Grid>
                    <Grid item xs={6} zeroMinWidth>
                        <Typography className="Current Price" variant="h4">EUR {props.item.Currently}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Buyout Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Buyout Price" variant="h4">EUR {props.item.Buy_Price}</Typography>
                    </Grid>
                </Grid>
            </CardContent>

            <CardContent className="Buttons">
                <Box>
                    <Button className="Bid Button" variant="contained">
                        Bid
                    </Button>
                    <Button className="Buyout Button" variant="contained">
                        Buyout
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}

function SquareAuctionItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Card className="Item">
            <CardMedia
                image="https://picsum.photos/250/250"
                title="Generic placeholder"
            />
            <CardContent className="ItemBody">
                <Typography variant="h2">
                    {props.item.Name}
                </Typography>

                <Box mb={3}>
                    <Typography display="inline"> Sold By:</Typography>

                    <Typography className="Seller" display="inline" variant="h5">
                        &nbsp; &nbsp;{props.item.User.Username}
                    </Typography>
                        
                    <Rating display="inline" value={rating} precision={0.5} readOnly />
                </Box>
                <Grid container className="Prices" spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Current Price:</Typography>
                    </Grid>
                    <Grid item xs={6} zeroMinWidth>
                        <Typography className="Current Price" variant="h4">EUR {props.item.Currently}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Buyout Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Buyout Price" variant="h4">EUR {props.item.Buy_Price}</Typography>
                    </Grid>
                </Grid>
                <Box mt={3} className="Buttons">
                    <Button className="Bid Button" variant="contained">
                        Bid
                    </Button>
                    <Button className="Buyout Button" variant="contained">
                        Buyout
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}

export default withRouter(SearchResults);