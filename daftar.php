<?php
include "database.php";

if  ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username   = trim($_POST["username_user"]);
    $email      = trim($_POST["gmail"]);
    $password   = $_POST["password_user"];
    $repassword = $_POST["repassword"];
    
    if  ($password !== $repassword)  {
        echo "<script>alert('Password tidak sama!');</script>";
    } else {
        $stmt = $db->prepare("INSERT INTO user (nama_user, gmail, password_user) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $password);

        if ($stmt->execute()) {
            header(header: 'Location: login.php');
        } else {
            echo "Gagal registrasi: " . $stmt->error;
        }

        $stmt->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style-login.css">
    <title>Daftar</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link rel="icon" type="logo jasa raharja[1].jpg" href="logo jasa raharja[1].jpg">
</head>
<body>
    <divc class="wrapper">
        <form method="POST">
            <h1>Register</h1>
            <div class="input-box">
                <input type="text" name="username_user" placeholder="Username" required>
            </div>
            <div class="input-box">
                <input type="email" name="gmail" placeholder="Gmail" required>
            </div>
            <div class="input-box">
                <input type="password" name="password_user" placeholder="Password" id="passwordInput" required>
                <span class="password-toggle" id="passwordToggle">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
             <div class="input-box">
                <input type="password" name="repassword" placeholder="Ulangi password" required>
            </div>       
            </div>
                <button type="submit" class="btn" href="login.php">Login</button>
                <div class="register-link">
                    <p>Sudah punya akun? <a href="login.php">Login</a></p>    
                </div>
        </from>
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

