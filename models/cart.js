const Product = require("./product")

module.exports = function Cart(oldCart) {
    this.items = oldCart.items || []
    this.totalQty = oldCart.totalQty || 0
    this.totalPrice = oldCart.totalPrice || 0

    this.add = function (item, id, size) {
        var storedItem = this.items.filter(i => i.itemId === id && i.size === size)[0]
        this.items = this.items.filter(i => i.itemId !== id || (i.itemId === id && i.size !== size))
        if (!storedItem) {
            storedItem = { itemId: id, item: item, size: size, qty: 0, price: 0 }
        }
        storedItem.qty++
        storedItem.price = item.price * storedItem.qty
        this.items.push(storedItem)
        this.items = this.items.filter(i => i.itemId !== 0)
        this.totalQty++
        this.totalPrice += storedItem.item.price
    }

    this.delete = async (productId, size) => {
        const deletedItem = this.items.filter(i => i.itemId === productId && i.size === size)[0]
        this.totalQty -= deletedItem.qty
        this.totalPrice -= deletedItem.price
        this.items = this.items.filter(i => i.itemId !== productId || (i.itemId === productId && i.size !== size))
    }

    this.generateArray = function () {
        var arr = []
        for (var id in this.items) {
            arr.push(this.items[id])
        }
        return arr
    }

    this.updatePrice = async _ => {
        for (var i = 0; i < this.items.length; i++) {
            await Product.findById(this.items[i].itemId)
                .then(product => {
                    if(product === null){
                        this.items.splice(i, 1)   
                    }else if(!product.active){
                        this.items[i].active=false
                        this.items[i].item.active=false
                        this.items[i].price = 0
                        console.log(this.items[i])
                    }else{
                        this.items[i].item = product
                        this.items[i].price = product.price * this.items[i].qty
                    }
                })
        }

        this.totalQty = 0
        this.totalPrice = 0

        for (var i = 0; i < this.items.length; i++) {
            this.totalQty += this.items[i].qty
            this.totalPrice += this.items[i].price
        }

        return this
    }

    this.updateTheQty = async (id,newQuantity,productIndex) => {
        this.items[productIndex].qty = Number(newQuantity)
        return this
    }

}