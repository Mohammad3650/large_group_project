from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class UserModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test6@example.com",
            password="password123",
            username="testuser6",
            first_name="Test",
            last_name="Six",
            phone_number="07123456789",
        )

        self.user2 = User.objects.create_user(
            email="test7@example.com",
            password="password123",
            username="testuser7",
            first_name="Test",
            last_name="Seven",
            phone_number="07123456788",
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, "test6@example.com")
        self.assertTrue(self.user.check_password("password123"))

    def test_str_representation(self):
        self.assertEqual(str(self.user), "test6@example.com - Test Six")

    def test_valid_user(self):
        self._assert_user_is_valid(self.user)

    def test_email_cannot_be_blank(self):
        self.user.email = ""
        self._assert_user_is_invalid(self.user, field="email")

    def test_email_must_be_unique(self):
        self.user.email = self.user2.email
        self._assert_user_is_invalid(self.user, field="email")

    def test_email_cannot_have_an_incorrect_format(self):
        self.user.email = "incorrectformat"
        self._assert_user_is_invalid(self.user, field="email")

    def test_email_must_contain_domain(self):
        self.user.email = "johndoe@example"
        self._assert_user_is_invalid(self.user, field="email")

    def _assert_user_is_valid(self, user):
        try:
            user.full_clean()
        except ValidationError as e:
            self.fail(f"Expected valid user, got errors: {e.message_dict}")

    def _assert_user_is_invalid(self, user, field=None):
        with self.assertRaises(ValidationError) as ctx:
            user.full_clean()

        if field is not None:
            self.assertIn(field, ctx.exception.message_dict)