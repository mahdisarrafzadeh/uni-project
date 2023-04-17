/* eslint-disable @next/next/no-img-element */
import NextLink from "next/link";
import { Grid, Link, Paper, Typography } from "@material-ui/core";
import Layout from "../components/Layout";
import db from "../utils/db";
import Product from "../models/Product";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Store } from "../utils/Store";
import ProductItem from "../components/ProductItem";
import Carousel from "react-material-ui-carousel";
import useStyles from "../utils/styles";
import ProductCarousel from "../components/ProductCarousel";

export default function Home(props) {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { topRatedProducts, featuredProducts, listByCategory } = props;
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert("محصول قابل سفارش نمیباشد");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };
  return (
    <Layout>
      <Carousel
        navButtonsAlwaysVisible
        className={classes.mt1}
        animation="slide"
      >
        {featuredProducts.map((product) => (
          <NextLink
            key={product._id}
            href={`/product/${product.slug}`}
            passHref
          >
            <Link>
              <img
                src={product.featuredImage}
                alt={product.name}
                className={classes.featuredImage}
              ></img>
            </Link>
          </NextLink>
        ))}
      </Carousel>
      <Grid container justify="space-between">
        <Grid item>
          <Typography variant="h2">محصولات پر طرفدار</Typography>
        </Grid>
        <Grid item>
          <Link href={`/search?query=`}>
            <Typography variant="h2">بازدید از تمام محصولات</Typography>
          </Link>
        </Grid>{" "}
      </Grid>
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item md={4} key={product.name}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </Grid>
        ))}
      </Grid>
      <ProductCarousel
        addToCartHandler={addToCartHandler}
        products={listByCategory}
      />
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    "-reviews"
  )
    .lean()
    .limit(3);
  const topRatedProductsDocs = await Product.find({}, "-reviews")
    .lean()
    .sort({
      rating: -1,
    })
    .limit(9);
  const listByCategory = await Product.find(
    { category: "شلوار" },
    "-reviews"
  ).lean();

  await db.disconnect();
  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
      listByCategory: listByCategory.map(db.convertDocToObj),
    },
  };
}
