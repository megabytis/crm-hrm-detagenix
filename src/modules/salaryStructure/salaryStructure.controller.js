const Salary = require("./salaryStructure.model");

exports.createSalary = async (req,res)=>{
try{

const { employeeId,basicSalary,hra,pf,bonus } = req.body;

const totalSalary = basicSalary + hra + bonus - pf;

const salary = await Salary.create({
employee: employeeId,
basicSalary,
hra,
pf,
bonus,
totalSalary
});

res.json({
success:true,
data:salary
});

}catch(err){
res.status(500).json({message:err.message});
}
};


exports.getSalary = async (req,res)=>{
try{

const salary = await Salary.find({employee:req.params.employeeId})
.populate("employee","name department");

res.json({
success:true,
data:salary
});

}catch(err){
res.status(500).json({message:err.message});
}
};