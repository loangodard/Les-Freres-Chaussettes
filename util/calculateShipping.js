exports.calculateShipping = (n) =>{
    if(n == 1){
        return 2.10
    }if(n==2){
        return 2.75
    }if(n>=3 && n<=6){
        return 4.10
    }if(n>=7){
        return 5.40
    }
}