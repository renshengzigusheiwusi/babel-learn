var fs =require('fs');
var babel = require("@babel/core");
var parser=require('@babel/parser');
var {default:traverse} =require("@babel/traverse");
var {default:generate} =require("@babel/traverse");
var t=require("@babel/types");
var str=fs.readFileSync("./test.js",'utf-8');
var ast=parser.parse(str);
var process={
    env:{
        NODE_ENV:"development"
    }
}
traverse(ast, {
    Identifier:function(path){
        if(path.node.name=="process"){
            
            var statement=path.getStatementParent();
            if(statement){
                var type=statement.node.type;
                switch(type){
                    case "IfStatement":{
                        var bool=IfStatement(statement);
                        if(bool){
                            statement.replaceWithMultiple(statement.node.consequent.body)
                        }
                        else{
                            statement.replaceWith(statement.node.alternate.body)
                        }
                        break;
                    }
                }
            }
        }
    }
  });
function IfStatement(path){
    var node=path.node;
    var test=node.test;
    if(test.type=="BinaryExpression"){
        return BinaryExpression(path.get("test"));
    }
} 
function BinaryExpression(path){
    var node=path.node;
    var left=node.left;
    var right=node.right;
    var v=null;
    var r=null;
    if(left.type=="MemberExpression"){
        v=MemberExpression(path.get("left"));

    }
    if(right.type=="StringLiteral"){
        r=right.value; 
    }
    return v===r;
}
function MemberExpression(path){
    var node=path.node;
    var object=node.object;
    var property=node.property;
    if(object.type=="MemberExpression"){
        return MemberExpression(path.get("object"))[property.name];
    }
    else if(object.type=="Identifier"){
        if(object.name=="process"){
            return process[property.name];
        }
    }
}
var result=babel.transformFromAstSync(ast);

console.log(result.code);