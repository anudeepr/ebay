/**
 * Created by Rentala on 22-09-2016.
 */

var calculate = function (req, res) {
    var response = executeCode(function () {
        console.log(req.body);
        var params = req.body.params,
            operators= req.body.operators,
            total = 0 ;
        //try using eval instead
        for(var i =0; i<operators.length; i++){
            switch (operators[i])
            {
                case 'add':
                    total = params[i] + params[i+1];
                    break;
                case 'minus':
                    total =  params[i] - params[i+1];
                    break;
                case 'times':
                    total =  params[i]*params[i+1];
                    break;
                case 'divide':
                    if(params[i+1] == 0 )
                        throw RangeError("Cannot divide by zero");
                    total =  params[i]/params[i+1];
                    break;
                default:
                    throw RangeError(operators[i] + " is not a valid operator");
            }
            params[i+1] = total;
        }
        return response = { result : true, total: total };
    });
    console.log(JSON.stringify(response));
    res.send(JSON.stringify(response));
};
exports.calculate = calculate;

var executeCode = function (fn) {
    try{
        return fn();
    }
    catch(e){
        console.log(e);
        return { result : false, message: e.message };
    }
}