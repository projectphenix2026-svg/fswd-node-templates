db.students.insertMany([{ name: "Asha", age: 19 }, { name: "Ravi", age: 22 }, { name: "Meena", age: 21 }, { name: "Kiran", age: 20 }])
db.students.find({ age: { $gt: 20 } })
db.students.drop()
