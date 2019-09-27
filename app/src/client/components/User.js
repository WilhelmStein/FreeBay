import React, { Component, useState } from "react";
import { getRandomColor } from './Utils'
import Axios from "axios";
import autoBind from "auto-bind";
import { withRouter } from 'react-router-dom'

import UserSettings from './UserSettings'
import PostAuction from './PostAuction';

import {
    Avatar, Card, CardHeader, CardMedia, CardContent,
    Grid, Typography, Box, Link,
    Button, Tab, Tabs
} from "@material-ui/core";

import Messages from './Messages'

import Pagination from 'material-ui-flat-pagination';
import Rating from "@material-ui/lab/Rating";

import SettingsIcon from "@material-ui/icons/Settings";
import GavelIcon from '@material-ui/icons/Gavel'
import MailIcon from '@material-ui/icons/Mail';

import "../style/User.scss";

class User extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userData: null,
            loggedAsTargetUser: false,
            settingsDialogOpen: false,
            postDialogOpen: false
        };

        autoBind(this);
    }

    componentDidMount() {
        this.updateData(this.props);
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.username !== nextProps.username)
        {
            this.updateData(nextProps);
        }
    }

    updateData(props) {
        let request = null;
        if(props.user && props.user.Username === props.username)
        {
            request = Axios.post(`/api/getUser`, {
                username: props.user.Username,
                password: props.user.Password
            })
        }
        else
        {
            request = Axios.get(`/api/publicUserDetails?username=${props.username}`)
        }

        request.then(res => {
            if(res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.setState({ userData: res.data.data })
        })
        .catch(err => console.error(err));
    }

    toggleSettingsDialog() {
        this.setState({ settingsDialogOpen: !this.state.settingsDialogOpen });
    }

    togglePostDialog()
    {
        this.setState({ postDialogOpen: !this.state.postDialogOpen })
    }

    render()
    {
        if (this.state.userData == null) {
            return <h1>{`Error: User ${this.props.username} not found.`}</h1>;
        }

        const loggedAsTargetUser = this.state.userData !== null && this.props.user && this.props.user.Username === this.props.username;

        const rating = Math.round(((this.state.userData.Seller_Rating * 5.0) / 100.0) * 2) / 2;

        const tab = () => {
            switch (this.props.tab)
            {
                case "active": return 0;
                case "past": return this.props.username ? 1 : 0;
                case "watched": return this.props.username && loggedAsTargetUser ? 2 : 0;
                case "messages": return this.props.username && loggedAsTargetUser ? 3 : 0;
                default: return 0;
            }
        }

        return (
            
            <Card raised className="UserCard" style={{margin: "20px"}}>
                <CardHeader
                    className="User CardHeader"
                    avatar={
                        <Avatar aria-label="User" className="UserAvatar" style={{backgroundColor: getRandomColor()}}>
                            {this.state.userData.Username.toUpperCase()[0]}
                        </Avatar>
                    }
                    title={ <Typography className="Title">{this.state.userData.Username}</Typography> }
                    subheader={
                        <Grid container >
                            <Grid item>
                                <Typography className="Title">Rating: </Typography>
                            </Grid>

                            <Grid item>
                                <Rating
                                    display="inline"
                                    value={rating}
                                    precision={0.5}
                                    readOnly
                                />
                            </Grid>
                        </Grid>
                    }
                    action={
                        loggedAsTargetUser
                        ?
                        <div>
                            <Button aria-label="settings" className="Settings Button Action" variant="contained" color="primary" onClick={this.toggleSettingsDialog}>
                                Settings &nbsp; <SettingsIcon/>
                            </Button>
                            <Button aria-label="post auction" className="Post Button Action" variant="contained" color="primary" onClick={this.togglePostDialog}>
                                Post Auction &nbsp; <GavelIcon/>
                            </Button>
                        </div>
                        
                        :
                        <Button 
                            className="Message Button Action" 
                            variant="contained" color="primary" 
                            onClick={() => {this.props.history.push(`/user/${this.props.user.Username}/messages/new&to=${this.props.username}`)}}
                        >
                            Message this user &nbsp; <MailIcon/>
                        </Button>
                    }
                />

                <UserSettings
                    open={this.state.settingsDialogOpen}
                    toggleDialog={this.toggleSettingsDialog}
                    userData={this.state.userData}
                    updateHandler={this.props.updateHandler}
                    history={this.props.history}
                />

                <PostAuction
                    open={this.state.postDialogOpen}
                    toggleDialog={this.togglePostDialog}
                    user={this.state.userData}
                />
                    
                <UserContent
                    tab={tab()}
                    action={this.props.action}
                    userData={this.state.userData}
                    loggedAsTargetUser={loggedAsTargetUser}
                    history={this.props.history}
                />
            </Card>
        );
    }
}

class UserContent extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            tabValue: this.props.tab,
            tabs: [{ label: "Active Auctions" }],
            currentAuctions: [],
            pastAuctions: [],
            watchedAuctions: [],
            messages: [],
            resultsPerPage: 10,
            offset: 2
        };

        autoBind(this);
    }

    componentDidMount() {
        this.getUserData(this.props);
        this.setTabs(this.props)
    }

    componentWillReceiveProps(nextProps) 
    {
        const loggedAsTargetUserEquality = nextProps.loggedAsTargetUser === this.props.loggedAsTargetUser;

        if (nextProps.userData.Id !== this.props.userData.Id)
            this.getUserData(nextProps);
        else
        {
            if (!loggedAsTargetUserEquality)
            {
                this.getUserData(nextProps);
            }
        }

        if (!loggedAsTargetUserEquality)
            this.setTabs(nextProps);

        if (nextProps.tab !== this.state.tabValue)
            this.changeTabValue(null, nextProps.tab)
    }

    getUserData(props)
    {
        this.getUserAuctions(props);

        if (props.loggedAsTargetUser)
        {
            this.getWatchedAuctions(props)   
        }

        this.getMessages(props);
    }

    getWatchedAuctions(props)
    {
        Axios.post(`/api/userWatchedAuctions`, {username: props.userData.Username, password: props.userData.Password})
        .then((res) => {
            if(res.data.err)
            {
                console.error(res.data.message)
                return;
            }

            this.setState({ watchedAuctions: res.data.data });
        })
        .catch((err) => console.error(err));
    }

    getUserAuctions(props)
    {
        Axios.get(`/api/userAuctions?username=${props.userData.Username}`)
        .then( (res) => {
            
            if(res.data.err)
            {
                console.error(res.data.message)
                return;
            }
        
            let currentAuctions = [];
            let pastAuctions = [];
            for (let i = 0; i < res.data.data.length; i++)
            {
                const auction = res.data.data[i];

                if (new Date(auction.Ends) - new Date() > 0)
                    currentAuctions.push(auction)
                else
                    pastAuctions.push(auction);
            }

            this.setState({ currentAuctions: currentAuctions, pastAuctions: pastAuctions });
        })
        .catch((err) => console.error(err));
    }

    getMessages(props=this.props)
    {
        if (!props.userData.Password) return;

        Axios.post("/api/messages", {username: props.userData.Username, password: props.userData.Password})
        .then((res) => {

            if (res.data.error)
            {
                console.error(res.data.message)
                return;
            }

            this.setState({
                messages: res.data.data,
            })
        })
        .catch(err => console.error(err));
    }

    setTabs(props)
    {
        let tabs = [];

        if (props.loggedAsTargetUser)
        {
            tabs=  [
                { label: "Active Auctions" },
                { label: "Past Auctions" },
                { label: "Watched Auctions" },
                { label: "Messages" }
            ]
        }
        else
        {
            tabs = [
                { label: "Active Auctions" },
                { label: "Past Auctions" },
            ]
        }

        this.setState({
            tabs: tabs
        })
    }

    changeTabValue(event, newValue) {
        this.setState({ tabValue: newValue });
    }

    render() {
        
        let currentPage = null;
        switch(this.state.tabValue)
        {
            case 0: currentPage = <AuctionGrid target={this.state.currentAuctions} history={this.props.history}/>; break;
            case 1: currentPage = <AuctionGrid target={this.state.pastAuctions} history={this.props.history}/>; break;
            case 2: currentPage = this.props.loggedAsTargetUser ? <AuctionGrid target={this.state.watchedAuctions} history={this.props.history}/> : null; break;
            case 3: currentPage = this.props.loggedAsTargetUser ? <Messages user={this.props.userData} action={this.props.action} messages={this.state.messages} onUpdate={this.getMessages}/> : null; break;
            default: currentPage = <div/>; break;
        }


        return (
            <div className="UserContent">
                <Tabs className="Tabs" value={this.state.tabValue} onChange={this.changeTabValue}>
                    {this.state.tabs.map(tab => (
                        <Tab key={tab.label} label={tab.label} className="Tab" />
                    ))}
                </Tabs>
                {currentPage}
            </div>
        );
    }
}

function AuctionGrid(props) {

    let [offset, setOffset] = useState(0);
    //let [resultsPerPage, setResultsPerPage] = useState(6);
    const resultsPerPage = 6;

    let content = props.target.slice(offset, offset + resultsPerPage).map((auction, index) => {

        let ended = (new Date(auction.Ends) - new Date() <= 0);

        return (
            <Grid item key={index}>
                <Card onClick={() => props.history.push(`/auction/${auction.Id}`)}>
                    <Grid container className="AuctionCard">
                        <Grid item>
                            <CardMedia className="Media"
                                    //component="img"
                                    image={auction.Images && auction.Images.length ? `/api/image?path=${auction.Images[0].Path}` : "https://dummyimage.com/150x250/ffffff/4a4a4a.png&text=No+Image"}
                                    title={auction.Name}
                            />
                        </Grid>

                        <Link href={`/auction/${auction.Id}`} className="Link">
                            <Grid item className="Details">
                                
                                    <CardContent>
                                        <Typography className="Title" noWrap>{auction.Name}</Typography>

                                        <Typography className={`Description ${auction.Description === "" ? " Empty" : ""}`} variant="body2">
                                            {auction.Description !== "" ? auction.Description : "No Description."}
                                        </Typography>              
                                    </CardContent>
                            </Grid>
                        </Link>

                        <Grid item className="Prices">
                            <CardContent>
                                <Grid container >
                                    <Grid item>
                                        <Typography variant="h5" className="Title">Starting Price:</Typography>
                                    </Grid>

                                    <Grid item>
                                        <Typography variant="h4" className="Price Starting">{auction.First_Bid ? `EUR ${parseFloat(auction.First_Bid).toFixed(2)}` : "-"}</Typography>
                                    </Grid>
                                </Grid>

                                {
                                    ended ? "" :
                                        <Grid container >
                                            <Grid item >
                                                <Typography variant="h5" className="Title">Current Price:</Typography>
                                            </Grid>
                                            <Grid item  zeroMinWidth>
                                                <Typography className="Price Current" variant="h4">{auction.Currently ? `EUR ${parseFloat(auction.Currently).toFixed(2)}` : "-"}</Typography>
                                            </Grid>
                                        </Grid>
                                }
                                
                                <Grid container >
                                    <Grid item >
                                        <Typography variant="h5" className="Title">
                                            { (ended) ? ("Bought for:") : ("Buyout Price:") }
                                        </Typography>
                                    </Grid>

                                    <Grid item >
                                        <Typography className="Price Buyout" variant="h4">{auction.Buy_Price ? `EUR ${parseFloat(auction.Buy_Price).toFixed(2)}` : "-"}</Typography>
                                    </Grid>
                                </Grid>

                                <Box className="Dates" mt={2}>
                                    <Typography>
                                        Started in: <span className="Started Date">{new Date(auction.Started).toLocaleString()}</span>
                                    </Typography>
                                    
                                    <Typography>
                                        {ended ? "Ended: " : "Ends in: "}
                                        <span className="Ends Date">{new Date(auction.Ends).toLocaleString()}</span>
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        )
    });

    return(
        content.length !== 0 ?

            <div className="AuctionGrid">
                <Pagination
                    className="Pagination"
                    size='large'
                    limit={resultsPerPage}
                    offset={offset}
                    total={props.target.length}
                    onClick={(e, offset) => setOffset(offset)}
                />

                <Grid container spacing={3}>
                    {content}
                </Grid>

                <Pagination
                    className="Pagination"
                    size='large'
                    limit={resultsPerPage}
                    offset={offset}
                    total={props.target.length}
                    onClick={(e, offset) => setOffset(offset)}
                />
            </div>
        : <Typography color="textSecondary" style={{padding: "50px"}}>No auctions</Typography>
    );
}

export default withRouter(User);