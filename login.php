<?php
session_start();
include "database.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username_user"]);
    $password = $_POST["password_user"];

    $stmt = $db->prepare("SELECT id FROM user WHERE nama_user = ? AND password_user = ?");
    $stmt->bind_param("ss", $username, $password);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $_SESSION["username_user"] = $username;
        header("Location: index.php");
        exit();
    } else {
        echo "<script>alert('Username atau Password tidak ditemukan!');</script>";
    }

    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style-login.css">
    <title>Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link rel="icon" type="logo jasa raharja[1].jpg" href="logo jasa raharja[1].jpg">
</head>
<body>
    
    <div class="wrapper">
        <h1>Login</h1>
        <form method="POST">
            <div class="input-box">
                <input type="text" name="username_user" placeholder="username" required>
            </div>
            <div class="input-box">
                <input type="password" name="password_user" placeholder="password" id="passwordInput" required>
                <span class="password-toggle" id="passwordToggle">
                    <i class="fas fa-eye"></i>
                </span>
            </div>    
                <button type="submit" class="btn">Login</button>
                <div class="register-link">
                    <p>tidak memiliki akun? <a href="daftar.php">Daftar</a></p>    
                </div> 
        </form>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const inputPass = document.getElementById('passwordInput');
            const tombolPass = document.getElementById('passwordToggle')

            tombolPass.addEventListener('click', function() {
                if (inputPass.type === 'password') {
                    inputPass.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    inputPass.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            })
        })
    </script>
</body>
</html>