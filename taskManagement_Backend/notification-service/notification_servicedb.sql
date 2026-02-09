-- MySQL dump 10.13  Distrib 8.4.1, for macos14 (arm64)
--
-- Host: localhost    Database: notification_servicedb
-- ------------------------------------------------------
-- Server version	8.4.1

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
-- Table structure for table `notification_preference`
--

DROP TABLE IF EXISTS `notification_preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_preference` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email_enabled` bit(1) NOT NULL,
  `in_app_enabled` bit(1) NOT NULL,
  `type` enum('COMMENT_MENTION','PROJECT_UPDATES','STATUS_CHANGED','TASK_ASSIGNED') DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preference`
--

LOCK TABLES `notification_preference` WRITE;
/*!40000 ALTER TABLE `notification_preference` DISABLE KEYS */;
INSERT INTO `notification_preference` VALUES (1,_binary '',_binary '\0','TASK_ASSIGNED',NULL),(2,_binary '',_binary '\0','STATUS_CHANGED',NULL),(3,_binary '',_binary '\0','COMMENT_MENTION',NULL),(4,_binary '',_binary '\0','PROJECT_UPDATES',NULL);
/*!40000 ALTER TABLE `notification_preference` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-01-03 07:30:32','design frontend team page',_binary '\0'),(2,'2026-01-03 07:45:49','Task \"API Gateways\" moved from OPEN → IN_PROGRESS',_binary '\0'),(3,'2026-01-03 07:59:36','Task \"API Gateways\" updated.',_binary '\0'),(4,'2026-01-03 07:59:46','Task \"JWT Authentication\" updated.',_binary '\0'),(5,'2026-01-03 08:24:12','Task \"API Gateways\" updated.',_binary '\0'),(6,'2026-01-03 08:24:24','Task \"JWT Authentication\" updated.',_binary '\0'),(7,'2026-01-03 08:24:40','Task \"Task Service CRUD\" updated.',_binary '\0'),(8,'2026-01-03 08:25:01','Task \"Frontend Task UI\" updated.',_binary '\0'),(9,'2026-01-03 08:25:11','Task \"Deployment Pipeline\" updated.',_binary '\0'),(10,'2026-01-03 08:27:54','Task \"API Gateways\" updated.',_binary '\0'),(11,'2026-01-03 08:32:46','You are invited to join team: 1',_binary '\0'),(12,'2026-01-03 08:33:02','Task \"JWT Authentication\" moved from IN_PROGRESS → DONE',_binary '\0'),(13,'2026-01-03 08:33:07','Task \"JWT Authentication\" moved from DONE → IN_PROGRESS',_binary '\0'),(14,'2026-01-03 08:33:11','Task \"Frontend Task UI\" moved from IN_PROGRESS → OPEN',_binary '\0'),(15,'2026-01-03 08:36:57','Task \"JWT Authentication\" moved from IN_PROGRESS → DONE',_binary '\0'),(16,'2026-01-03 08:37:09','Task \"JWT Authentication\" moved from DONE → IN_PROGRESS',_binary '\0'),(17,'2026-01-03 09:48:23','Task \"todo\" deleted.',_binary '\0'),(18,'2026-01-04 03:51:41','Task \"API Gateways\" moved from IN_PROGRESS → OPEN',_binary '\0'),(19,'2026-01-04 03:51:50','Task \"Task Service CRUD\" moved from OPEN → IN_PROGRESS',_binary '\0'),(20,'2026-01-04 04:20:55','Task \"g\" deleted.',_binary '\0'),(21,'2026-01-04 07:15:34','Task \"API Gateways\" updated.',_binary '\0'),(22,'2026-01-04 07:23:03','Task \"Frontend Task UI\" updated.',_binary '\0'),(23,'2026-01-04 08:51:51','Task \"API Gateways\" updated.',_binary '\0'),(24,'2026-01-04 08:58:11','Task \"API Gateways\" updated.',_binary '\0'),(25,'2026-01-04 08:58:24','Task \"API Gateways\" updated.',_binary '\0'),(26,'2026-01-04 09:20:33','Task \"API Gateways\" updated.',_binary '\0'),(27,'2026-01-04 09:22:43','Task \"API Gateways\" updated.',_binary '\0'),(28,'2026-01-04 09:22:56','Task \"API Gateways\" updated.',_binary '\0'),(29,'2026-01-04 10:06:22','Task \"0auth\" deleted.',_binary '\0'),(30,'2026-01-04 11:42:43','Task \"API Gateways\" updated.',_binary '\0'),(31,'2026-01-04 11:42:57','Task \"API Gateways\" updated.',_binary '\0'),(32,'2026-01-04 15:00:57','Task \"vffv\" deleted.',_binary '\0'),(33,'2026-01-05 00:55:15','Task \"Design Landing Page\" updated.',_binary '\0'),(34,'2026-01-05 00:55:33','Task \"Design Landing Page\" moved from OPEN → IN_PROGRESS',_binary '\0'),(35,'2026-01-05 00:56:39','Task \"Implement Login & Signup Forms\" updated.',_binary '\0'),(36,'2026-01-05 00:58:34','Task \"Implement Login & Signup Forms\" updated.',_binary '\0'),(37,'2026-01-05 00:58:51','You are invited to join team: 2',_binary '\0'),(38,'2026-01-05 01:05:03','Task \"Design Landing Page\" updated.',_binary '\0'),(39,'2026-01-05 01:05:22','Task \"Implement Login & Signup Forms\" updated.',_binary '\0'),(40,'2026-01-05 01:07:58','Task \"Implement REST APIs for Projects\" updated.',_binary '\0'),(41,'2026-01-05 01:09:11','You are invited to join team: 3',_binary '\0'),(42,'2026-01-05 01:10:02','You are invited to join team: 3',_binary '\0'),(43,'2026-01-05 01:10:31','Task \"Implement REST APIs for Projects\" updated.',_binary '\0'),(44,'2026-01-05 01:10:41','Task \"Implement REST APIs for Projects\" moved from IN_PROGRESS → DONE',_binary '\0'),(45,'2026-01-05 01:12:04','Task \"Implement Login & Signup Forms\" updated.',_binary '\0'),(46,'2026-01-05 01:14:16','Task \"Add Task Input Field\" updated.',_binary '\0'),(47,'2026-01-05 01:22:41','Task \"Display Task List\" updated.',_binary '\0'),(48,'2026-01-05 01:23:30','Task \"API Gateways\" updated.',_binary '\0'),(49,'2026-01-05 01:23:57','Task \"JWT Authentication\" updated.',_binary '\0'),(50,'2026-01-05 01:24:44','You are invited to join team: 2',_binary '\0'),(51,'2026-01-05 01:24:56','You were removed from team: 2',_binary '\0'),(52,'2026-01-05 01:28:09','You are invited to join team: 1',_binary '\0'),(53,'2026-01-05 01:28:32','You are invited to join team: 2',_binary '\0'),(54,'2026-01-05 01:28:52','You were removed from team: 3',_binary '\0'),(55,'2026-01-05 01:28:56','You were removed from team: 3',_binary '\0'),(56,'2026-01-05 01:29:41','You are invited to join team: 3',_binary '\0'),(57,'2026-01-05 01:29:58','You are invited to join team: 3',_binary '\0'),(58,'2026-01-05 01:30:34','Task \"Add Task Input Field\" updated.',_binary '\0'),(59,'2026-01-05 01:30:54','Task \"Display Task List\" updated.',_binary '\0'),(60,'2026-01-05 01:31:39','Task \"Implement Login & Signup Forms\" updated.',_binary '\0'),(61,'2026-01-05 01:32:15','Task \"Implement REST APIs for Projects\" updated.',_binary '\0'),(62,'2026-01-05 01:46:51','Task \"Deployment Pipeline\" deleted.',_binary '\0'),(63,'2026-01-05 01:46:54','Task \"Add Task Input Field\" moved from IN_PROGRESS → DONE',_binary '\0'),(64,'2026-01-05 01:46:57','Task \"Add Task Input Field\" moved from DONE → IN_PROGRESS',_binary '\0'),(65,'2026-01-05 01:46:59','Task \"Design Landing Page\" moved from IN_PROGRESS → DONE',_binary '\0'),(66,'2026-01-05 01:47:02','Task \"Display Task List\" moved from OPEN → IN_PROGRESS',_binary '\0'),(67,'2026-01-05 15:28:54','Task \"API Gateways\" updated.',_binary '\0'),(68,'2026-01-05 15:28:56','Task \"API Gateways\" moved from OPEN → IN_PROGRESS',_binary '\0'),(69,'2026-01-05 15:28:58','Task \"API Gateways\" moved from IN_PROGRESS → OPEN',_binary '\0'),(70,'2026-01-07 16:32:16','Task \"API Gateways\" moved from OPEN → IN_PROGRESS',_binary '\0'),(71,'2026-01-07 16:32:24','Task \"API Gateways\" moved from IN_PROGRESS → OPEN',_binary '\0'),(72,'2026-01-07 16:56:19','Task \"API Gateways\" moved from OPEN → IN_PROGRESS',_binary '\0'),(73,'2026-01-07 16:56:44','Task \"API Gateways\" moved from IN_PROGRESS → OPEN',_binary '\0'),(74,'2026-01-08 16:04:26','Task \"API Gateways\" moved from OPEN → IN_PROGRESS',_binary '\0'),(75,'2026-01-08 16:04:32','Task \"API Gateways\" moved from IN_PROGRESS → OPEN',_binary '\0');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13 10:46:40
