from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class UserModelTest(TestCase):
    """Tests for the User model"""

    def setUp(self):
        """
        Creates two valid user instances before each test runs
        """
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
        """
        Ensures a user is created correctly with@
        - the expected email
        - a properly hashed password
        """
        self.assertEqual(self.user.email, "test6@example.com")
        self.assertTrue(self.user.check_password("password123"))

    def test_str_representation(self):
        """
        Verifies the string representation
        Expect format: "email - FirstName LastName"
        """
        self.assertEqual(str(self.user), "test6@example.com - Test Six")

    def test_valid_user(self):
        """Confirms that a correctly populated user passes validation"""
        self._assert_user_is_valid(self.user)

    def test_email_cannot_be_blank(self):
        """
        Ensures that email field cannot be empty
        Setting email to an empty string should trigger validation error
        """
        self.user.email = ""
        self._assert_user_is_invalid(self.user, field="email")

    def test_email_must_be_unique(self):
        """
        Ensures that duplicate emails are not allowed.

        Assigning an existing user's email should fail validation.
        """
        self.user.email = self.user2.email
        self._assert_user_is_invalid(self.user, field="email")

    def test_email_cannot_have_an_incorrect_format(self):
        """
        Ensures email must follow a valid format.
        Example of invalid format: missing an '@'
        """
        self.user.email = "incorrectformat"
        self._assert_user_is_invalid(self.user, field="email")

    def test_email_must_contain_domain(self):
        """
        Ensures email must include a valid domain.
        Example of invalid email:
        - 'johndoe@example'
        """
        self.user.email = "johndoe@example"
        self._assert_user_is_invalid(self.user, field="email")

    def _assert_user_is_valid(self, user):
        """
        Helper method:
        Asserts that a user instance passes model validation.

        Fails the test if any ValidationError is raised.
        """
        user.full_clean()

    def _assert_user_is_invalid(self, user, field=None):
        """
        Helper method:
        Asserts that a user instance fails validation.

        Optionally checks that a specific field is included
        in the validation errors.
        """
        with self.assertRaises(ValidationError) as ctx:
            user.full_clean()

        if field is not None:
            self.assertIn(field, ctx.exception.message_dict)
