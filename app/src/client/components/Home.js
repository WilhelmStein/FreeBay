import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Fade, Card, Grid, CardMedia, CardContent, Typography, Box} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating'
import Carousel from './CarouselWrapper';
import '../style/Home.scss';
import axios from 'axios';
import autoBind  from 'auto-bind';

class Home extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            recommended: [],
            history: props.history
        };

        autoBind(this);
    }

    componentDidMount()
    {
        this.getRecommended(this.props.user);
    }

    componentWillReceiveProps(nextProps)
    {
        if (nextProps.user !== this.props.user)
        {
            this.getRecommended(nextProps.user);
        }
    }

    getRecommended(user)
    {
        let request = undefined;
        let after = undefined;

        if (user !== null)
        {
            request = axios.get(`/python/${user.Id}`);
            after = (data) => {
                axios.post('/api/recommended/specific', {ids: data.map( (row) => row.id)})
                .then( res => {
                    if (res.data.error)
                    {
                        console.error(res.data.message)
                        return;
                    }

                    const recommended = res.data.data.sort((a, b) => {
                        return parseInt(a.Id) - parseInt(b.Id)
                    })
                    .map ((item, index) => {
                        item.index = index;
                        return item;
                    })

                    this.setState({
                        recommended: recommended.sort((a, b) => {
                            return data[a.index].score - data[b.index].score;
                        })
                    })
                })
            }
        }
        else
        {
            request = axios.post('/api/recommended', {user_id: null})
        }

        if (!request) return;

        request.then( res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            if (after) 
            {
                after(res.data.data);
                return;
            }

            this.setState({
                recommended: res.data.data
            });
        })
        .catch(err => {console.error(err)});
    }

    render()
    {
        return (
            <div className="Home">
                <Carousel user={this.props.user} loginHandler={this.props.loginHandler}/>

                <div className="Recommended">
                    <h2>{this.props.user ? "Recommended for you" : "Popular Items"}</h2>
                    <Grid container
                        direction = "row"
                        justify = "flex-start"
                        alignItems = "center"
                        spacing={3}
                        className="RecommendedGrid"
                    >
                        {this.state.recommended.map( (item) => {
                            return <RecommendedItem key={item.Id} item={item} history={this.state.history}/>
                        })}
                    </Grid>
                </div>
            </div>
        );
    }
}

class RecommendedItem extends Component
{
    constructor(props)
    {
        super(props);

        autoBind(this);

        this.state = {
            item: props.item
        }
    }

    onItemClick(e)
    {
        this.props.history.push(`/auction/${this.state.item.Id}`);

        e.stopPropagation();
    }

    onSellerClick(e)
    {
        this.props.history.push(`/user/${this.state.item.User.Username}`);
        e.stopPropagation();
    }

    render()
    {
        const rating = Math.round((this.state.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;
        return (
            <Fade in={true}>
                <Grid key={this.state.item.Id} item className = "Wrapper">
                    <Card raised className="Item" onClick={this.onItemClick}>
                        <CardMedia className="Media"
                            image={this.state.item.Images && this.state.item.Images.length ? `/api/image?path=${this.state.item.Images[0].Path}` : "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                            title={this.state.item.Name}
                        />

                        <CardContent className="ItemBody">
                            <Typography className="Title" variant="h4" title={this.state.item.Name} noWrap>
                                {this.state.item.Name}
                            </Typography>

                            <Box className="SellerBox">
                                <Typography display="inline" noWrap> Sold By:</Typography>

                                <Typography className="Seller" display="inline" variant="h5" onClick={this.onSellerClick} noWrap>
                                    &nbsp; &nbsp;{this.state.item.User.Username}
                                </Typography>

                                <Rating className="Rating" display="inline" value={rating} precision={0.5} readOnly />
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Fade>
        )
    }
}

export default withRouter(Home);