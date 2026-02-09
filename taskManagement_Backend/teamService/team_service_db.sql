-- MySQL dump 10.13  Distrib 8.4.1, for macos14 (arm64)
--
-- Host: localhost    Database: team_service_db
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
-- Table structure for table `team_audit_logs`
--

DROP TABLE IF EXISTS `team_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `performed_by` bigint DEFAULT NULL,
  `target_user` bigint DEFAULT NULL,
  `team_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_audit_logs`
--

LOCK TABLES `team_audit_logs` WRITE;
/*!40000 ALTER TABLE `team_audit_logs` DISABLE KEYS */;
INSERT INTO `team_audit_logs` VALUES (1,'Created team','2026-01-03 07:45:26.015250',1,NULL,1),(2,'Added member anushree@gmail.com','2026-01-03 08:32:46.324286',1,2,1),(3,'Created team','2026-01-05 00:49:20.027382',1,NULL,2),(4,'Created team','2026-01-05 00:57:31.110559',1,NULL,3),(5,'Added member anushree@gmail.com','2026-01-05 00:58:51.347873',1,2,2),(6,'Added member sneha@gmail.com','2026-01-05 01:09:10.887684',1,3,3),(7,'Added member kavana@gmail.com','2026-01-05 01:10:02.033505',1,4,3),(8,'Added member sneha@gmail.com','2026-01-05 01:24:43.578929',1,3,2),(9,'Removed member','2026-01-05 01:24:56.143896',1,3,2),(10,'Added member sneha@gmail.com','2026-01-05 01:28:09.427449',1,3,1),(11,'Added member kavana@gmail.com','2026-01-05 01:28:32.314988',1,4,2),(12,'Removed member','2026-01-05 01:28:52.320345',1,3,3),(13,'Removed member','2026-01-05 01:28:56.177504',1,4,3),(14,'Added member ganavi@gmail.com','2026-01-05 01:29:40.744399',1,5,3),(15,'Added member anushree@gmail.com','2026-01-05 01:29:58.069632',1,2,3);
/*!40000 ALTER TABLE `team_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `team_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmreuu88ksu0sw6wy64dqa1cv3` (`team_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,'ADMIN','ACTIVE',1,1),(2,'MEMBER','INVITED',1,2),(3,'ADMIN','ACTIVE',2,1),(4,'ADMIN','ACTIVE',3,1),(5,'MEMBER','INVITED',2,2),(9,'MEMBER','INVITED',1,3),(10,'MEMBER','INVITED',2,4),(11,'MEMBER','INVITED',3,5),(12,'MEMBER','INVITED',3,2);
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'2026-01-03 07:45:25.996373',1,'UIDesigner Team'),(2,'2026-01-05 00:49:19.999501',1,'Frontend Team'),(3,'2026-01-05 00:57:31.098629',1,'Backend Team');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-11 13:38:56
