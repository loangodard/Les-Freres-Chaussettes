module.exports = function CustomCart(oldCart) {
    this.items = oldCart.items || []
    this.totalQty = oldCart.totalQty || 0
    this.totalPrice = oldCart.totalPrice || 0

    this.add = function (item, qty, price) {
        this.items.push({item,price:price,qty:qty})
        this.totalQty += qty
        this.totalPrice += price
    }

    this.delete = async (index,price,qty)=> {
        this.items.splice(index,1)
        this.totalPrice = this.totalPrice - Number(price)
        this.totalQty = this.totalQty - Number(qty)
    }
}