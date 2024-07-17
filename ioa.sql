-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: localhost    Database: matched
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `entries`
--

DROP TABLE IF EXISTS `entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` varchar(255) NOT NULL,
  `mailid` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `amount` decimal(11,2) DEFAULT NULL,
  `entry_date` varchar(255) NOT NULL,
  `acc_number` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entries`
--

LOCK TABLES `entries` WRITE;
/*!40000 ALTER TABLE `entries` DISABLE KEYS */;
INSERT INTO `entries` VALUES (52,'finance','threeteebank@gmail.com','Funds Received',899.00,'2024-07-15','4583'),(53,'finance','threeteebank@gmail.com','Funds Sent',899.00,'2024-07-15','4583'),(54,'accounts','3t.rohit@gmail.com','Advices Updated',89.00,'2024-07-15','4583'),(55,'accounts','3t.rohit@gmail.com','Purchase Voucher Sum',98.00,'2024-07-15','4583'),(56,'accounts','3t.rohit@gmail.com','Previous Day Debtors',98.00,'2024-07-15','4583'),(57,'accounts','3t.rohit@gmail.com','Today\'s Debtors',98.00,'2024-07-15','4583'),(58,'accounts','3t.rohit@gmail.com','Tax Invoices',98.00,'2024-07-15','4583'),(59,'accounts','3t.rohit@gmail.com','Today\'s Creditors',67.00,'2024-07-15','4583'),(60,'accounts','3t.rohit@gmail.com','Previous Day Creditors',87.00,'2024-07-15','4583');
/*!40000 ALTER TABLE `entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `past_entries`
--

DROP TABLE IF EXISTS `past_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `past_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` varchar(255) DEFAULT NULL,
  `mailid` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `entry_date` varchar(255) DEFAULT NULL,
  `acc_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `past_entries`
--

LOCK TABLES `past_entries` WRITE;
/*!40000 ALTER TABLE `past_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `past_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `access` varchar(255) DEFAULT 'unknown',
  `status` varchar(255) DEFAULT 'unknown',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8,'tarungurgaon26@gmail.com','$2b$10$syzCIP8Tu7gq/7OzRCAlbebnAB.thriH0qhe5DaUwsAuqxw.duEge','accounts','unknown','unknown'),(9,'3t.rohit@gmail.com','$2b$10$ymQ5a.6V04kUgsxSiy9DR..Eom6ofGmui/mPYACWlZVuuCP5yAqty','accounts','unknown','unknown'),(11,'kamiya.glt@gmail.com','$2b$10$Xz3RJMGzmKOEiCeM8DiOsObM.nUGmKCbYO4srudl89OuFXaD2ez3S','cfo','unknown','unknown'),(12,'threeteebank@gmail.com','$2b$10$by1Xi1y0bbhJb41SHSqfLe28fDhUpotUvhoVztodwqXktQiVbxKFi','finance','unknown','unknown'),(28,'pooja.sachdeva@3tl.in','$2b$10$LPswoHgBWfq8905VxM1r0e6QmB8MUIAI67.3/PuynHxKOoqOvGMgy','accounts','unknown','unknown');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-17 11:58:48
