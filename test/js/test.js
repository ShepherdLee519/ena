$(function() {
    $('#generate').click(function() {
        $.get('./php/mysql_to_csv.php', res => {
            if (res) console.log(res);
        });
        return false;
    });

    $('#export').click(function() {
        const data = [
            {
                '名称': 'Tanmay', '城市': 'Bangalore', '邮编': '560001'
            },
            {
                '名称': 'Sachin', '城市': 'Munbai', '邮编': '400003'
            },
            {
                '名称': 'Uma', '城市': 'Pune', '邮编': '411027'
            }
        ];
        $.get('./php/json_to_csv.php', 
            {data: data}, 
            res => {
            console.log(res);
        });
        return false;
    });

    $('#import').click(function() {
        $.get('./php/csv_to_json.php', res => {
            res = JSON.parse(res);
            console.log(res);
        })
        return false;
    });
});