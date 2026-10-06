const express = require("express");
const app = express();

app.use(express.json());

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
  },
  {
    id: "3",
    name: "Sam Johnson",
    email: "sam.johnson@example.com",
  },
];

app.get("/api/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json(user);
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
  };

  users.push(newUser);

  res.status(201).json(newUser);
});


app.put("/api/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const { name, email } = req.body;

  user.name = name;
  user.email = email;

  res.status(200).json(user);
});

app.delete("/api/users/:id", (req, res) => {
  const index = users.findIndex((user) => user.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  users.splice(index, 1);

  res.status(204).send();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
