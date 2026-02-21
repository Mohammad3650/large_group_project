# TODO: Standardise time format. If keeping current format, update time utils to allow multiple days. Test
class TimeUtils:
    """Time conversion helpers.
    
    All times are represented as minutes since day 0 midnight.
    """

    @staticmethod
    def hm_to_min(hhmm: str) -> int:
        """Convert 'HH:MM' (24h) to minutes since midnight."""
        h, m = map(int, hhmm.split(":"))
        return h * 60 + m

    @staticmethod
    def min_to_hm(t: int) -> str:
        """Convert minutes since midnight to 'HH:MM' (24h)."""
        return f"{t // 60:02d}:{t % 60:02d}"