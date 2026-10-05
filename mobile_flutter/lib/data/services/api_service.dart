import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // Use localhost on web/desktop, and 10.0.2.2 for Android emulator
  static String get baseUrl {
    if (kIsWeb) return 'http://127.0.0.1:8001';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:8001';
    } catch (_) {}
    return 'http://127.0.0.1:8001';
  }

  static Future<ExpenseStats> fetchStats() async {
    final res = await http.get(Uri.parse('$baseUrl/api/expenses/stats'));
    if (res.statusCode == 200) {
      return ExpenseStats.fromJson(jsonDecode(res.body));
    }
    throw Exception('Failed to load stats: ${res.statusCode}');
  }

  static Future<SpendingHistory> fetchHistory(String period) async {
    final res = await http.get(Uri.parse('$baseUrl/api/expenses/history?period=$period'));
    if (res.statusCode == 200) {
      return SpendingHistory.fromJson(jsonDecode(res.body));
    }
    throw Exception('Failed to load history');
  }

  static Future<List<Product>> fetchProducts({String? search, String? category}) async {
    String query = '';
    if (search != null && search.isNotEmpty) query += 'search=$search&';
    if (category != null && category != 'all') query += 'category=$category&';

    final res = await http.get(Uri.parse('$baseUrl/api/products?$query'));
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map((j) => Product.fromJson(j)).toList();
    }
    throw Exception('Failed to load products');
  }

  static Future<Product> createProduct(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/products'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) {
      return Product.fromJson(jsonDecode(res.body));
    }
    throw Exception('Failed to create product: ${res.body}');
  }

  static Future<void> updateProduct(int id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/api/products/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      throw Exception('Failed to update product');
    }
  }

  static Future<void> deleteProduct(int id) async {
    final res = await http.delete(Uri.parse('$baseUrl/api/products/$id'));
    if (res.statusCode != 200) {
      throw Exception('Failed to delete product');
    }
  }

  static Future<List<Expense>> fetchExpenses({int limit = 100}) async {
    final res = await http.get(Uri.parse('$baseUrl/api/expenses?limit=$limit'));
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map((j) => Expense.fromJson(j)).toList();
    }
    throw Exception('Failed to load expenses');
  }

  static Future<Expense> createExpense(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/expenses'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) {
      return Expense.fromJson(jsonDecode(res.body));
    }
    throw Exception('Failed to record expense: ${res.body}');
  }

  static Future<void> deleteExpense(int id) async {
    final res = await http.delete(Uri.parse('$baseUrl/api/expenses/$id'));
    if (res.statusCode != 200) {
      throw Exception('Failed to delete expense');
    }
  }

  static Future<Map<String, dynamic>> sendChatMessage(String message, [String? apiKey]) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/chat'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'message': message, 'api_key': apiKey}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception('Chat failed: ${res.body}');
  }
}
