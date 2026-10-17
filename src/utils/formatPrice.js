const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default formatPrice;
