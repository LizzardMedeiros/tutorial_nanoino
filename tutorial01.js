//Carrega as dependências
var five = require("johnny-five");
var axios = require('axios');
var config = require('./config.json');

//Inicia a placa a placa
var board = new five.Board();

//Endpoint do saldo NANO da carteira estipulada no arquivo config.json
const url = "https://snapy.io/api/v1/balance/"+config.snapy.wallet;

//Inicia o Arduino
board.on("ready", function() {
    //Declara o LCD, o LED e a variável de saldo corrente
    var lcd = new five.LCD({controller: "JHD162A", pins: [7, 8, 9, 10, 11, 12]});
    var led = new five.Led(3);
    var cur_balance = -1;

    //Define o texto inicial do LCD
    lcd.cursor(0, 0).print("Nano Balance:");
    lcd.cursor(1, 0).print("Carregando...");

    //Função "loop" do arduíno, configurado para repetir a cada 5 segundos (5000 ms)
	this.loop(5000, () => {
        //Baixa o saldo da carteira definida no config.json
		axios.get(url, {headers:{'x-api-key':config.snapy.key}})
		    .then((r) => {
		    	if(r.data.status != 'error'){
                    var balance = r.data.balance/1000000;
                    /*Verifica se o saldo aumentou em relação ao saldo corrente
                    / Caso positivo, acende o led
                    / Caso negativo, apaga o led
                    */
                    if(cur_balance != -1 && balance > cur_balance){
                        led.on();
                    }
                    else{
                        led.off();
                    }
                    //Atualiza o saldo corrente
                    cur_balance = balance;
                    lcd.clear().cursor(1, 0).print(balance.toString());
                    lcd.cursor(0, 0).print("Nano Balance:");
		    	}
		    	else{
                    //Erro na configuração do config.json
                    lcd.clear().cursor(1, 0).print("Não foi possível");
                    lcd.cursor(0, 0).print("Erro!");
		    	}
		    })
		    .catch(() => {
                //Erro de conexão, das dependências ou do arduíno
		    	lcd.cursor(1, 0).print("Erro!");
		    });
	});

});
