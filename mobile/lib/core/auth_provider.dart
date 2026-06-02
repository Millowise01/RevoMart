import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';

class AuthProvider extends ChangeNotifier {
  final _api = ApiClient();
  Map<String, dynamic>? user;
  bool loading = false;

  bool get isLoggedIn => user != null;
  bool get isAdmin => user?['role'] == 'ADMIN';

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token == null) return;
    try {
      user = await _api.get('/users/me') as Map<String, dynamic>;
      notifyListeners();
    } catch (_) {
      await logout();
    }
  }

  Future<void> login(String email, String password) async {
    loading = true;
    notifyListeners();
    try {
      final res = await _api.post('/auth/login', {
        'email': email,
        'password': password,
      }) as Map<String, dynamic>;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', res['accessToken'] as String);
      user = res['user'] as Map<String, dynamic>;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    user = null;
    notifyListeners();
  }
}
